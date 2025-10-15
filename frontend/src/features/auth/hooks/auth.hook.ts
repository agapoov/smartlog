import { authApi } from '../api/auth-requests'
import { useMutation } from '@tanstack/react-query'
import { AUTH_LOGIN_MUTATION_KEY } from '../const/auth.const'

export const useAuthMutation = () => {
	return useMutation({
		mutationKey: [AUTH_LOGIN_MUTATION_KEY],
		mutationFn: authApi.login,
	})
}
