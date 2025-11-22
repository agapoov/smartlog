import { useNavigate, useSearch } from '@tanstack/react-router'

export const useRedirectAfterLogin = () => {
	const navigate = useNavigate()
	const { redirect = '/' } = useSearch({ from: '/login/' }) as { redirect?: string }

	const goBack = () => {
		navigate({ to: redirect as any })
	}

	return goBack
}
