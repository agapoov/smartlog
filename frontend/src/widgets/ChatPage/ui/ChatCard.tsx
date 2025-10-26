import type { IChat } from '@/features/chat'
import { Badge } from 'antd'
import dayjs from 'dayjs'

interface IProps {
	chat: IChat
	isActive: boolean
	onClick: () => void
}

export const ChatCard = ({ chat, onClick }: IProps) => {
	const lastMessageTime = chat.last_message ? dayjs(new Date(chat.last_message.created_at)).format('HH:mm') : null

	return (
		<button onClick={onClick} className={`w-full text-left transition-colors rounded-lg hover:bg-gray-100`}>
			<div className="flex items-center gap-3 p-3">
				{/* Аватар */}
				<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium shrink-0">
					{chat.name.charAt(0).toUpperCase()}
				</div>

				<div className="flex-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-medium truncate flex-1">{chat.name}</h3>
						{lastMessageTime && <span className="text-xs text-gray-600 shrink-0">{lastMessageTime}</span>}
					</div>

					<p className="text-sm text-gray-600 truncate mt-1">{chat.last_message?.content || 'Нет сообщений'}</p>
				</div>

				{/* Бейдж с зарезервированным местом */}
				<div className="w-6 h-6 shrink-0">
					{chat.unread_count > 0 && <Badge count={chat.unread_count} className="absolute" color="blue" />}
				</div>
			</div>
		</button>
	)
}
