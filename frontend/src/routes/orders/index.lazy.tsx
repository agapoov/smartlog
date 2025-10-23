import { OrdersPage } from '@/widgets/OrdersPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/orders/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <OrdersPage />
}
