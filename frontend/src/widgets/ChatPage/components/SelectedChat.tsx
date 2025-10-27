import { MoreOutlined } from '@/shared/ui'
import { ScrollArea } from '@/shared/ui/ScrollArea'
import { Button } from 'antd'
import { type FC, useCallback } from 'react'
import { useGetChatMessages, type IChat } from '@/features/chat'
import { OutcomeMessage } from '../ui/OutcomeMessage'
import { IncomingMessage } from '../ui/IncomingMessage'
import { MessageInput } from '../ui/MessageInput'
import { useChatWebSocket } from '@/features/chat/ws/chatWs.socket'
import { authUtils } from '@/features/auth'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_GET_ALL_CHATS } from '@/features/chat/consts/queryKeys'

interface IProps {
	selectedChat: IChat | null
}

export const SelectedChat: FC<IProps> = ({ selectedChat }) => {
	const token = authUtils.getAccessToken()
	const user = authUtils.getUser()
	const chatId = selectedChat?.id
	const queryClient = useQueryClient()

	const { data: response, isLoading } = useGetChatMessages(chatId ?? '', {
		page_size: 100,
	})

	const messages = response?.results ?? []

	const { send: wsSend, readMessage } = useChatWebSocket({
		chatId: chatId ?? '',
		token,
		onReadMessage: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})

	const handleSend = useCallback(
		(text: string) => {
			if (!chatId || !text.trim()) return
			wsSend({
				type: 'chat_message',
				content: text.trim(),
			})
		},
		[chatId, wsSend],
	)

	const handleMarkAsRead = useCallback(
		(msgId: string) => {
			readMessage(msgId)
		},
		[readMessage],
	)

	if (!selectedChat) {
		return (
			<div className="flex-1 flex items-center justify-center text-muted-foreground">
				<p className="text-lg">Выберите чат для начала общения</p>
			</div>
		)
	}

	return (
		<>
			<header className="flex items-center justify-between p-4 border-b border-border">
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
						<div className="flex items-center justify-center py-8 text-muted-foreground">Загрузка сообщений...</div>
					) : messages.length === 0 ? (
						<div className="flex items-center justify-center py-8 text-gray-600">Нет сообщений</div>
					) : (
						messages.map((msg) => {
							const isOutgoing = user?.id === msg.sender.id
							const handleVisible = () => {
								handleMarkAsRead(msg.id)
							}

							return isOutgoing ? (
								<OutcomeMessage key={msg.id} message={msg} />
							) : (
								<div key={msg.id} onMouseEnter={handleVisible}>
									<IncomingMessage message={msg} />
								</div>
							)
						})
					)}
				</div>
			</ScrollArea>

			<MessageInput onSend={handleSend} />
		</>
	)
}
