import { MoreOutlined } from '@/shared/ui'
import { ScrollArea } from '@/shared/ui/ScrollArea'
import { Button } from 'antd'
import { type FC } from 'react'
import { mockMessages } from '../mock/mockData'
import { OutcomeMessage } from '../ui/OutcomeMessage'
import { IncomingMessage } from '../ui/IncomingMessage'
import type { IChat } from '@/features/chat'
import { MessageInput } from '../ui/MessageInput'

interface IProps {
	selectedChat: IChat | null
}

const handleSendMessage = (text: string) => {
	console.log('send →', text)
}

export const SelectedChat: FC<IProps> = ({ selectedChat }) => {
	return (
		<>
			<header className="flex items-center justify-between p-4 border-b border-gray-200">
				<div className="flex items-center gap-3">
					<div>
						<h2 className="font-semibold">{selectedChat?.name || 'Выберите чат'}</h2>
						{selectedChat?.participants_count && (
							<p className="text-sm text-muted-foreground">{selectedChat?.participants_count || 0} участников</p>
						)}
					</div>
				</div>
				<Button size="small">
					<MoreOutlined />
				</Button>
			</header>

			<ScrollArea className="flex-1 px-4 py-2">
				<div className="space-y-4">
					{mockMessages.map((msg) => {
						const isOutgoing = msg.sender.id === 1
						return isOutgoing ? (
							<OutcomeMessage key={msg.id} message={msg} />
						) : (
							<IncomingMessage key={msg.id} message={msg} />
						)
					})}
				</div>
			</ScrollArea>

			<MessageInput onSend={handleSendMessage} />
		</>
	)
}
