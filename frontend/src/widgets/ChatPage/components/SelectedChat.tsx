import { MoreOutlined } from '@/shared/ui'
import { ScrollArea } from '@/shared/ui/ScrollArea'
import { Button } from 'antd'
import { type FC } from 'react'
import { useGetChatMessages, type IChat } from '@/features/chat'
import { OutcomeMessage } from '../ui/OutcomeMessage'
import { IncomingMessage } from '../ui/IncomingMessage'
import { MessageInput } from '../ui/MessageInput'

interface IProps {
	selectedChat: IChat | null
}

export const SelectedChat: FC<IProps> = ({ selectedChat }) => {
	const chatId = selectedChat?.id

	const { data: response, isLoading } = useGetChatMessages(chatId ?? '')

	const messages = response?.results ?? []

	if (!selectedChat) {
		return (
			<div className="flex-1 flex items-center justify-center text-muted-foreground">
				<p className="text-lg">Выберите чат для начала общения</p>
			</div>
		)
	}

	return (
		<>
			<header className="flex items-center justify-between p-4 border-b border-gray-200">
				<div className="flex items-center gap-3">
					<div>
						<h2 className="font-semibold">{selectedChat.name}</h2>
						<p className="text-sm text-muted-foreground">{selectedChat.participants_count} участников</p>
					</div>
				</div>
				<Button size="small">
					<MoreOutlined />
				</Button>
			</header>

			<ScrollArea className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="space-y-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-muted-foreground">Загрузка сообщений...</div>
						</div>
					) : messages.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-gray-600">Нет сообщений</div>
						</div>
					) : (
						messages.map((msg) => {
							const isOutgoing = msg.sender.id === 1
							return isOutgoing ? (
								<OutcomeMessage key={msg.id} message={msg} />
							) : (
								<IncomingMessage key={msg.id} message={msg} />
							)
						})
					)}
				</div>
			</ScrollArea>

			<MessageInput chatId={selectedChat.id} />
		</>
	)
}
