import { Button, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState, type FC } from 'react'
import { mockChats } from '../mock/mockData'
import { ScrollArea } from '@/shared/ui/ScrollArea'
import { ChatCard } from '../ui/ChatCard'
import type { IChat } from '@/features/chat'
import { ModalAddChat } from '../ui/ModalAddChat'

interface IProps {
	selectedChat: IChat | null
	setSelectedChat: React.Dispatch<React.SetStateAction<IChat | null>>
}
export const ChatList: FC<IProps> = ({ selectedChat, setSelectedChat }) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [modalAdd, setModalAdd] = useState(false)

	const filteredChats = mockChats.filter(
		(c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.description.toLowerCase().includes(searchQuery.toLowerCase()),
	)
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
					{filteredChats.map((chat) => (
						<ChatCard
							key={chat.id}
							chat={chat}
							isActive={selectedChat?.id === chat.id}
							onClick={() => setSelectedChat(chat)}
						/>
					))}
				</div>
			</ScrollArea>
			<ModalAddChat isOpen={modalAdd} onClose={() => setModalAdd(false)} />
		</aside>
	)
}

export default ChatList
