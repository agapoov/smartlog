import { createFileRoute, redirect } from '@tanstack/react-router'
import { authStore } from '@/features/auth'

export const Route = createFileRoute('/cargo/index/cargo')({
	component: Login,
	pendingComponent: () => {
		if (authStore.isAuthenticated) {
			throw redirect({ to: '/' })
		}
	},
})

function Login() {
	return <CargoPage />
}
