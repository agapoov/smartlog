import { ResponsesPage } from '@/widgets/ResponsesPage/ui/ResponsesPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/responses/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ResponsesPage />
}
