import { createLazyFileRoute } from '@tanstack/react-router'

import { CargoPage } from '@/widgets/CargoPage'

export const Route = createLazyFileRoute('/cargo/')({
	component: Page,
})

function Page() {
	return <CargoPage />
}
