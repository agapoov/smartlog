import type { IChat } from '@/features/chat'
import { useState } from 'react'
import ChatList from '../components/ChatList'
import { SelectedChat } from '../components/SelectedChat'

export const ChatPage = () => {
	const [selectedChat, setSelectedChat] = useState<IChat | null>(null)

	return (
		<div className="flex h-screen bg-background overflow-hidden">
			<ChatList selectedChat={selectedChat} setSelectedChat={setSelectedChat} />

			<section className="flex flex-col flex-1">
				{selectedChat ? (
					<SelectedChat selectedChat={selectedChat} />
				) : (
					<div className="flex-1 flex items-center justify-center text-muted-foreground">
						<p className="text-lg text-gray-600">Выберите чат для начала общения</p>
					</div>
				)}
			</section>
		</div>
	)
}
