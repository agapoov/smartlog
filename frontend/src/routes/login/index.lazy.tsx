import { createLazyFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/widgets'
import { authStore } from '@/features/auth'

export const Route = createLazyFileRoute('/login/')({
	component: Login,
	pendingComponent: () => {
		if (authStore.isAuthenticated) {
			throw redirect({ to: '/' })
		}
	},
})

function Login() {
	return <LoginForm />
}
