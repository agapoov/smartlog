import { authStore } from '@/features/auth'
import { ChatPage } from '@/widgets/ChatPage'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/chat/')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()

	useEffect(() => {
		if (!authStore.isAuthenticated) {
			navigate({ to: '/login', search: { redirect: '/chat/' } })
		}
	}, [navigate])

	return authStore.isAuthenticated ? <ChatPage /> : null
}
