import axios, { type InternalAxiosRequestConfig } from 'axios'
import { tokenService } from '@/shared/lib/token-service'
import { $host } from '@/shared/api/base'
import { RefreshResponseSchema } from '../model/types'

// Авторизованный клиент
export const $authHost = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
	withCredentials: false,
})

// Interceptor для добавления токена авторизации
const authInterceptor = (config: InternalAxiosRequestConfig) => {
	if (!config || !config.headers) {
		throw new Error('Axios: не задан config')
	}

	const token = tokenService.access
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
}

// Навешиваем interceptor на запросы
$authHost.interceptors.request.use(authInterceptor)

// Interceptor для обработки 401 ошибок и автоматического обновления токенов
$authHost.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// Если ошибка не 401, просто отклоняем
		if (error.response?.status !== 401) {
			return Promise.reject(error)
		}

		// Избегаем бесконечного цикла обновления токенов
		if (originalRequest._retry) {
			tokenService.clear()
			return Promise.reject(error)
		}

		originalRequest._retry = true

		try {
			const refreshToken = tokenService.refresh
			if (!refreshToken) {
				tokenService.clear()
				return Promise.reject(error)
			}

			const response = await $host.post('api/login/refresh/', {
				refresh: refreshToken,
			})

			const validatedData = RefreshResponseSchema.parse(response.data)
			tokenService.setAccess(validatedData.access)

			// Повторяем оригинальный запрос с новым токеном
			originalRequest.headers.Authorization = `Bearer ${validatedData.access}`
			return axios(originalRequest)
		} catch (refreshError) {
			tokenService.clear()
			return Promise.reject(refreshError)
		}
	},
)

// Общий перехватчик ошибок
$authHost.interceptors.response.use(
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
