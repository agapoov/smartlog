import { createFileRoute } from '@tanstack/react-router'

import { CargoPage } from '@/widgets/CargoPage'

export const Route = createFileRoute('/cargo/index/cargo')({
	component: Page,
})

function Page() {
	return <CargoPage />
}
