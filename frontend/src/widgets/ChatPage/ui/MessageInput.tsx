import { useSendMessage } from '@/features/chat'
import { PaperClipOutlined, SendOutlined } from '@/shared/ui'
import { Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useRef, useState, type FC } from 'react'

interface IProps {
	chatId: string
}

export const MessageInput: FC<IProps> = ({ chatId }) => {
	const [text, setText] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const sendMutation = useSendMessage(chatId)

	const handleSend = () => {
		if (!text.trim() || sendMutation.isPending) return

		sendMutation.mutate(
			{
				content: text.trim(),
				message_type: 'text',
			},
			{
				onSuccess: () => {
					setText('')
					textareaRef.current?.focus()
				},
			},
		)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	useEffect(() => {
		textareaRef.current?.focus()
	}, [])

	return (
		<div className="flex items-end gap-2 p-4 border-t border-gray-200 bg-background">
			<Button className="shrink-0" disabled>
				<PaperClipOutlined />
			</Button>

			<div className="flex-1">
				<TextArea
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Напишите сообщение..."
					className="min-h-10 max-h-32 resize-none border-0 p-0 focus-visible:ring-0"
					rows={1}
					disabled={sendMutation.isPending}
				/>
			</div>

			<Button
				onClick={handleSend}
				className="shrink-0"
				type="primary"
				loading={sendMutation.isPending}
				disabled={!text.trim() || sendMutation.isPending}
			>
				<SendOutlined />
			</Button>
		</div>
	)
}
