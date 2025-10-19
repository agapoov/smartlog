import { $host } from '../../../shared/api/base'
import { tokenService } from '../../../shared/lib/token-service'
import { type LoginRequest, type TokenResponse, TokenResponseSchema, RefreshResponseSchema } from '../model/types'
import { authStore } from '../store/auth.store'
import { redirect } from '@tanstack/react-router'

export interface RegisterRequest {
	username: string
	email: string
	password: string
	password2: string
	first_name: string
	last_name: string
}

export const authApi = {
	// Регистрация нового пользователя
	async register(credentials: RegisterRequest): Promise<TokenResponse> {
		const response = await $host.post('api/register/', credentials)
		const validatedData = TokenResponseSchema.parse(response.data)

		// Сохраняем токены
		tokenService.setAccess(validatedData.access)
		tokenService.setRefresh(validatedData.refresh)

		authStore.isAuthenticated = true

		return validatedData
	},

	// Вход в систему
	async login(credentials: LoginRequest): Promise<TokenResponse> {
		const response = await $host.post('api/login/', credentials)
		const validatedData = TokenResponseSchema.parse(response.data)

		// Сохраняем токены
		tokenService.setAccess(validatedData.access)
		tokenService.setRefresh(validatedData.refresh)

		authStore.isAuthenticated = true

		return validatedData
	},

	// Обновление токена доступа
	async refreshToken(): Promise<string> {
		const refreshToken = tokenService.refresh
		if (!refreshToken) {
			throw new Error('Refresh token отсутствует')
		}

		const response = await $host.post('api/login/refresh/', {
			refresh: refreshToken,
		})

		const validatedData = RefreshResponseSchema.parse(response.data)
		tokenService.setAccess(validatedData.access)
		authStore.isAuthenticated = true

		return validatedData.access
	},

	// Выход из системы
	async logout(): Promise<void> {
		tokenService.clear()
		authStore.isAuthenticated = false
		redirect({ to: '/login' })
	},
}
