import axios from 'axios'
import { tokenService } from '../lib/token-service'
import { authStore } from '../../features/auth/store/auth.store'

// Базовый клиент без аутентификации
export const $host = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
	withCredentials: false,
})

// Аутентифицированный клиент
export const $auth = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
	withCredentials: false,
})

// Флаг для предотвращения множественных refresh запросов
let isRefreshing = false
let failedQueue: Array<{
	resolve: (value?: any) => void
	reject: (error?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error)
		} else {
			resolve(token)
		}
	})

	failedQueue = []
}

// Interceptor для добавления токена к запросам
$auth.interceptors.request.use(
	(config) => {
		const token = tokenService.access
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

// Interceptor для обработки ответов и автоматического refresh
$auth.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// Если получили 401 и это не запрос на refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// Если уже идет процесс refresh, добавляем запрос в очередь
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`
						return $auth(originalRequest)
					})
					.catch((err) => {
						return Promise.reject(err)
					})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				// Проверяем, нужен ли refresh
				if (tokenService.needsRefresh()) {
					// Обновляем токен
					const response = await $host.post('api/token/refresh/', {
						refresh: tokenService.refresh,
					})

					const newAccessToken = response.data.access
					tokenService.setAccess(newAccessToken)

					processQueue(null, newAccessToken)

					// Повторяем оригинальный запрос с новым токеном
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
					return $auth(originalRequest)
				} else {
					// Refresh token тоже истек - разлогиниваем
					throw new Error('Refresh token expired')
				}
			} catch (refreshError) {
				// Не удалось обновить токен - разлогиниваем пользователя
				processQueue(refreshError, null)
				tokenService.clear()
				authStore.isAuthenticated = false

				// Перенаправляем на страницу входа
				window.location.href = '/login'
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		// Обработка других ошибок
		const modifiedError = error
		let errorMessage = 'Произошла неизвестная ошибка'

		if (error.response?.data?.details) {
			errorMessage = error.response.data.details
		}
		if (error.response?.data?.detail) {
			errorMessage = error.response.data.detail
		}

		modifiedError.message = errorMessage
		throw modifiedError
	},
)

// Общий перехватчик ошибок для базового клиента
$host.interceptors.response.use(
	(response) => response,
	(error) => {
		const modifiedError = error
		let errorMessage = 'Произошла неизвестная ошибка'

		if (error.response?.data?.details) {
			errorMessage = error.response.data.details
		}
		if (error.response?.data?.detail) {
			errorMessage = error.response.data.detail
		}

		modifiedError.message = errorMessage
		throw modifiedError
	},
)
