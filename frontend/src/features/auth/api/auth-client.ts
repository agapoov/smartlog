import axios, { type InternalAxiosRequestConfig } from 'axios'
import { tokenService } from '@/shared/lib/token-service'
import { RefreshResponseSchema } from '../model/types'
import { authStore } from '../store/auth.store'

export const $host = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
	withCredentials: false,
})
// Авторизованный клиент
export const $authHost = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
	withCredentials: false,
})

// --- REQUEST INTERCEPTOR ---
const authInterceptor = (config: InternalAxiosRequestConfig) => {
	if (!config?.headers) throw new Error('Axios: не задан config')
	const token = tokenService.access
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
}
$authHost.interceptors.request.use(authInterceptor)

// --- ОЧЕРЕДЬ ДЛЯ ПАРАЛЛЕЛЬНЫХ 401 ---
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
	failedQueue = []
}

$authHost.interceptors.response.use(
	(r) => (console.log('OK:', r.config.url), r),
	(e) => (console.log('ERR:', e.config?.url, e.response?.status), Promise.reject(e)),
)

// --- RESPONSE INTERCEPTOR (основной) ---
$authHost.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		if (error.response?.status !== 401 || originalRequest._retry) {
			return Promise.reject(error)
		}

		// Если уже обновляем — ставим в очередь
		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject })
			})
				.then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`
					return $authHost(originalRequest)
				})
				.catch((err) => Promise.reject(err))
		}

		originalRequest._retry = true
		isRefreshing = true

		try {
			if (!tokenService.needsRefresh()) {
				throw new Error('Refresh token expired or missing')
			}

			const response = await $host.post('api/token/refresh/', {
				refresh: tokenService.refresh,
			})

			const validatedData = RefreshResponseSchema.parse(response.data)
			const newAccessToken = validatedData.access

			tokenService.setAccess(newAccessToken)
			processQueue(null, newAccessToken)

			originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
			return $authHost(originalRequest)
		} catch (refreshError) {
			processQueue(refreshError, null)
			await authStore.logout() // ← ЕДИНСТВЕННАЯ ТОЧКА ВЫХОДА
			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	},
)

// --- ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК (оставь, но ниже основного) ---
$authHost.interceptors.response.use(
	(response) => response,
	(error) => {
		const modifiedError = error
		let errorMessage = 'Произошла неизвестная ошибка'
		if (error.response?.data?.details) errorMessage = error.response.data.details
		if (error.response?.data?.detail) errorMessage = error.response.data.detail
		modifiedError.message = errorMessage
		throw modifiedError
	},
)
