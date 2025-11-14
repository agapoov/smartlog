import type { IMessage } from '@/features/chat'
import { ArrowLeftOutlined, MoreOutlined, PaperClipOutlined } from '@/shared/ui'
import { Button, Tooltip } from 'antd'
import dayjs from 'dayjs'
import type { FC } from 'react'

interface IProps {
	message: IMessage
}

export const IncomingMessage: FC<IProps> = ({ message }) => {
	const time = dayjs(message.created_at).format('HH:mm')

	return (
		<div className="flex gap-2 px-4">
			{/* Контент сообщения */}
			<div className="max-w-lg bg-blue-100 p-2 rounded-lg">
				{/* Имя + время */}
				<div className="flex items-center gap-2 mb-1">
					<span className="font-bold text-sm">{message.sender.first_name}</span>
					<span className="text-xs text-muted-foreground text-gray-600">{time}</span>
				</div>

				{/* Ответ на сообщение */}
				{message.reply_to && (
					<div className="bg-muted/50 rounded-lg p-2 mb-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<ArrowLeftOutlined className="h-3 w-3" />
							<span>{message.reply_to.sender.first_name}</span>
						</div>
						<p className="truncate">{message.reply_to.content}</p>
					</div>
				)}

				{/* Текст / файл */}
				<div className="">
					{message.message_type === 'file' ? (
						<div className="flex items-center gap-2">
							<PaperClipOutlined className="h-4 w-4" />
							<span className="text-sm">{message.files[0]?.name}</span>
						</div>
					) : (
						<p className="text-sm break-words">{message.content}</p>
					)}

					{/* Статус редактирования */}
					{message.is_edited && <span className="text-xs text-gray-300 ml-2">(изм.)</span>}
				</div>
			</div>

			{/* Кнопка More — появляется справа при ховере */}
			<Tooltip title="Функция в разработке">
				<Button type="text" size="small" icon={<MoreOutlined />} />
			</Tooltip>
		</div>
	)
}
