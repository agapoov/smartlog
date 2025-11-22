import { authStore } from '@/features/auth'
import { ResponsesPage } from '@/widgets/ResponsesPage/ui/ResponsesPage'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/responses/')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()

	useEffect(() => {
		if (!authStore.isAuthenticated) {
			navigate({ to: '/login', search: { redirect: '/responses/' } })
		}
	}, [navigate])

	return authStore.isAuthenticated ? <ResponsesPage /> : null
}
