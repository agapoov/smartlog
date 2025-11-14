import { PaperClipOutlined, SendOutlined } from '@/shared/ui'
import { Button, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useRef, useState, type FC } from 'react'

interface IProps {
	onSend: (text: string) => void
}

export const MessageInput: FC<IProps> = ({ onSend }) => {
	const [text, setText] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleSend = () => {
		if (!text.trim()) return

		onSend(text.trim())
		setText('')
		textareaRef.current?.focus()
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
			<Tooltip title="Функция в разработке">
				<Button className="shrink-0" disabled>
					<PaperClipOutlined />
				</Button>
			</Tooltip>

			<div className="flex-1">
				<TextArea
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Напишите сообщение..."
					className="min-h-10 max-h-32 resize-none border-0 p-0 focus-visible:ring-0"
					rows={1}
				/>
			</div>

			<Button onClick={handleSend} className="shrink-0" type="primary" disabled={!text.trim()}>
				<SendOutlined />
			</Button>
		</div>
	)
}
