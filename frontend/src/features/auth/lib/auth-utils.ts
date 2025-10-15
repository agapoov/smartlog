import { tokenService } from '@/shared/lib/token-service'

export const authUtils = {
	// Проверка авторизован ли пользователь
	isAuthenticated(): boolean {
		return tokenService.hasValidTokens()
	},

	// Получение токена доступа
	getAccessToken(): string {
		return tokenService.access
	},

	// Проверка истек ли токен (базовая проверка)
	isTokenExpired(token: string): boolean {
		if (!token) return true

		try {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const currentTime = Date.now() / 1000
			return payload.exp < currentTime
		} catch {
			return true
		}
	},

	// Проверка нужно ли обновить токен (проверяем близок ли к истечению)
	shouldRefreshToken(): boolean {
		const token = tokenService.access
		if (!token) return false

		try {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const currentTime = Date.now() / 1000
			// Обновляем токен за 5 минут до истечения
			return payload.exp - currentTime < 300
		} catch {
			return true
		}
	},
}
