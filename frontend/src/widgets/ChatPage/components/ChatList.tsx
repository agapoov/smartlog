import { Button, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState, type FC } from 'react'
import { ScrollArea } from '@/shared/ui/ScrollArea'
import { ChatCard } from '../ui/ChatCard'
import { useGetAllChats, type IChat } from '@/features/chat'
import { ModalAddChat } from '../ui/ModalAddChat'
import useToastStatus from '@/shared/utils/useToastStatus.utils'

interface IProps {
	selectedChat: IChat | null
	setSelectedChat: React.Dispatch<React.SetStateAction<IChat | null>>
}

export const ChatList: FC<IProps> = ({ selectedChat, setSelectedChat }) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [modalAdd, setModalAdd] = useState(false)

	const {
		data: response,
		isLoading,
		error,
		status,
	} = useGetAllChats({
		search: searchQuery || undefined,
		page_size: 50,
	})

	useToastStatus({ status, errorMsg: error?.message })

	const chats = response?.results ?? []

	return (
		<aside className="flex flex-col w-full md:w-sm border-r border-gray-200">
			<header className="p-4 border-b border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-bold">Чаты</h1>
					<Button onClick={() => setModalAdd(true)} size="small">
						<PlusOutlined />
					</Button>
				</div>

				<Input
					placeholder="Поиск чатов..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</header>

			<ScrollArea className="flex-1">
				<div className="p-2">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-gray-600">Загрузка чатов...</div>
						</div>
					) : chats.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-gray-600">{searchQuery ? 'Чаты не найдены' : 'Нет доступных чатов'}</div>
						</div>
					) : (
						chats.map((chat) => (
							<ChatCard
								key={chat.id}
								chat={chat}
								isActive={selectedChat?.id === chat.id}
								onClick={() => setSelectedChat(chat)}
							/>
						))
					)}
				</div>
			</ScrollArea>

			<ModalAddChat isOpen={modalAdd} onClose={() => setModalAdd(false)} />
		</aside>
	)
}

export default ChatList
