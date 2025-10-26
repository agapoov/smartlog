import { $host } from '../../../shared/api/base'
import { tokenService } from '../../../shared/lib/token-service'
import { type LoginRequest, type TokenResponse, TokenResponseSchema, RefreshResponseSchema } from '../model/types'
import { authStore } from '../store/auth.store'

export interface RegisterRequest {
	username: string
	email: string
	password: string
	password2: string
	first_name: string
	last_name: string
}

export const authApi = {
	async register(credentials: RegisterRequest): Promise<TokenResponse> {
		const { data } = await $host.post('api/register/', credentials)
		const validated = TokenResponseSchema.parse(data)

		tokenService.setAccess(validated.access)
		tokenService.setRefresh(validated.refresh)
		tokenService.setUser(validated.user)

		authStore.isAuthenticated = true
		return validated
	},

	async login(credentials: LoginRequest): Promise<TokenResponse> {
		const { data } = await $host.post('api/login/', credentials)
		const validated = TokenResponseSchema.parse(data)

		tokenService.setAccess(validated.access)
		tokenService.setRefresh(validated.refresh)
		tokenService.setUser(validated.user)

		authStore.isAuthenticated = true
		return validated
	},

	async refreshToken(): Promise<string> {
		const refresh = tokenService.refresh
		if (!refresh) throw new Error('Refresh token missing')

		const { data } = await $host.post('api/token/refresh/', { refresh })
		const validated = RefreshResponseSchema.parse(data)

		tokenService.setAccess(validated.access)
		authStore.isAuthenticated = true
		return validated.access
	},

	async logout(): Promise<void> {
		tokenService.clear()
		authStore.isAuthenticated = false
		window.location.href = '/login'
	},
}
