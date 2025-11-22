import { authStore } from '@/features/auth'
import { OrdersPage } from '@/widgets/OrdersPage'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/orders/')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()

	useEffect(() => {
		if (!authStore.isAuthenticated) {
			navigate({ to: '/login', search: { redirect: '/orders/' } })
		}
	}, [navigate])

	return authStore.isAuthenticated ? <OrdersPage /> : null
}
