// src/routes/cargo/index.lazy.tsx
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { CargoPage } from '@/widgets/CargoPage'
import { authStore } from '@/features/auth'

const CargoRouteComponent = () => {
	const navigate = useNavigate()

	useEffect(() => {
		if (!authStore.isAuthenticated) {
			navigate({ to: '/login', search: { redirect: '/cargo/' } })
		}
	}, [navigate])

	return authStore.isAuthenticated ? <CargoPage /> : null
}

export const Route = createLazyFileRoute('/cargo/')({
	component: CargoRouteComponent,
} as const)
