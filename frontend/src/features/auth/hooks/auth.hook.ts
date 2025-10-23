import { authApi } from '../api/auth-requests'
import { useMutation } from '@tanstack/react-query'
import { AUTH_LOGIN_MUTATION_KEY, AUTH_REGISTER_MUTATION_KEY } from '../const/auth.const'

export interface LoginFormData {
	username: string
	password: string
}

export interface RegisterFormData {
	username: string
	email: string
	password: string
	password2: string
	first_name: string
	last_name: string
}

export const useAuthMutation = (type: 'login' | 'register' = 'login') => {
	return useMutation({
		mutationKey: [type === 'login' ? AUTH_LOGIN_MUTATION_KEY : AUTH_REGISTER_MUTATION_KEY],
		mutationFn: (data: LoginFormData | RegisterFormData) =>
			type === 'login' ? authApi.login(data as LoginFormData) : authApi.register(data as RegisterFormData),
	})
}
