import { ChatPage } from '@/widgets/ChatPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/chat/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ChatPage />
}
