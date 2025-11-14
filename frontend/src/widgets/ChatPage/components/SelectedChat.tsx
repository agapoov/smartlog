import { MoreOutlined } from '@ant-design/icons'
import { ScrollArea } from '@/shared/ui/ScrollArea'
import { Button } from 'antd'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import { useAddMember, useGetChatMessages, type IChat } from '@/features/chat'
import { OutcomeMessage } from '../ui/OutcomeMessage'
import { IncomingMessage } from '../ui/IncomingMessage'
import { MessageInput } from '../ui/MessageInput'
import { useChatWebSocket } from '@/features/chat/ws/chatWs.socket'
import { authUtils } from '@/features/auth'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_GET_ALL_CHATS } from '@/features/chat/consts/queryKeys'
import { ModalAddMembers } from './ModalAddMembers'
import useToastStatus from '@/shared/utils/useToastStatus.utils'

interface IProps {
	selectedChat: IChat | null
}

export const SelectedChat: FC<IProps> = ({ selectedChat }) => {
	const token = authUtils.getAccessToken()
	const user = authUtils.getUser()
	const chatId = selectedChat?.id
	const queryClient = useQueryClient()

	const { data: response, isLoading } = useGetChatMessages(chatId ?? '', {
		page_count: 100,
	})

	const messages = response?.data ?? []
	const reversedMessages = [...messages].reverse()

	const {
		send: wsSend,
		readMessage,
		lastMessage,
	} = useChatWebSocket({
		chatId: chatId ?? '',
		token,
		onReadMessage: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})

	const addMember = useAddMember(chatId!)

	const scrollContainerRef = useRef<HTMLDivElement | null>(null)
	const [isUserScrolling, setIsUserScrolling] = useState(false)
	const [modalOpen, setModalOpen] = useState(false)

	const scrollToBottom = useCallback((smooth = false) => {
		const container = scrollContainerRef.current
		if (!container) return
		container.scrollTo({
			top: container.scrollHeight,
			behavior: smooth ? 'smooth' : 'auto',
		})
	}, [])

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom(false)
		}
	}, [chatId, messages.length, scrollToBottom])

	useEffect(() => {
		if (!lastMessage || isUserScrolling) return
		scrollToBottom(true)
	}, [lastMessage, isUserScrolling, scrollToBottom])

	const handleScroll = useCallback(() => {
		const container = scrollContainerRef.current
		if (!container) return
		const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
		setIsUserScrolling(distanceFromBottom > 150)
	}, [])

	const handleSend = useCallback(
		(text: string) => {
			if (!chatId || !text.trim()) return
			wsSend({
				type: 'chat_message',
				content: text.trim(),
			})
			scrollToBottom(true)
		},
		[chatId, wsSend, scrollToBottom],
	)

	const handleMarkAsRead = useCallback(
		(msgId: string) => {
			readMessage(msgId)
		},
		[readMessage],
	)

	const handleAddParticipants = (userIds: number[]) => {
		for (const userId of userIds) {
			addMember.mutateAsync({ user_id: userId, is_admin: false })
		}
	}

	useToastStatus({ status: addMember.status, errorMsg: addMember.error })

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

				<Button size="small" onClick={() => setModalOpen(true)}>
					<MoreOutlined />
				</Button>
			</header>

			<ScrollArea className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-100">
				<div ref={scrollContainerRef} className="h-full overflow-y-auto space-y-4 pr-2" onScroll={handleScroll}>
					{isLoading ? (
						<div className="flex items-center justify-center py-8 text-muted-foreground">Загрузка сообщений...</div>
					) : reversedMessages.length === 0 ? (
						<div className="flex items-center justify-center py-8 text-gray-600">Нет сообщений</div>
					) : (
						reversedMessages.map((msg) => {
							const isOutgoing = user?.id === msg.sender.id
							const handleVisible = () => handleMarkAsRead(msg.id)
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

			<ModalAddMembers
				chat={selectedChat}
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onAddParticipants={handleAddParticipants}
			/>
		</>
	)
}
