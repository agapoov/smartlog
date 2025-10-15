import { authApi } from '@/features/auth/api/auth-requests'

export const authErrorHandler = async (error: any, retryCallback?: () => void) => {
	console.error('Auth error:', error)
	
	// Если мы на странице логина, не пытаемся обновить токен
	if (window.location.pathname === '/login') {
		return
	}
	
	// Если ошибка 401, пытаемся обновить токен
	if (error.response?.status === 401) {
		try {
			await authApi.refreshToken()
			// Если обновление прошло успешно и есть callback, выполняем повторный запрос
			if (retryCallback) {
				retryCallback()
			}
		} catch (refreshError) {
			console.error('Failed to refresh token:', refreshError)
			// Перенаправляем на страницу логина
			window.location.href = '/login'
		}
	}
} 