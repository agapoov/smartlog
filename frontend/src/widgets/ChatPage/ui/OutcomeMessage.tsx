import type { IMessage } from '@/features/chat'
import { MoreOutlined, PaperClipOutlined } from '@/shared/ui'
import { Button } from 'antd'
import dayjs from 'dayjs'
import type { FC } from 'react'

interface IProps {
	message: IMessage
}

export const OutcomeMessage: FC<IProps> = ({ message }) => {
	const time = dayjs(message.created_at).format('HH:mm')

	return (
		<div className="flex justify-end gap-2 px-4 ">
			<Button type="text" size="small" icon={<MoreOutlined />} />
			<div className=" flex bg-gray-50 rounded-lg flex-col">
				{message.reply_to && (
					<div className="relative bg-gray-300 m-2 rounded-xl rounded-l-none p-2 text-sm">
						<div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-400 rounded-l-lg" />
						<div className="flex items-center gap-1 text-primary">
							<span>{message.reply_to.sender.first_name}</span>
						</div>
						<p className="truncate">{message.reply_to.content}</p>
					</div>
				)}

				<div className=" rounded-lg max-w-md p-3 inline-block">
					{message.message_type === 'file' ? (
						<div className="flex items-center gap-2">
							<PaperClipOutlined className="h-4 w-4" />
							<span className="text-sm">{message.files[0]?.name}</span>
						</div>
					) : (
						<p className="text-sm break-words">{message.content}</p>
					)}

					<div className="flex items-center justify-end gap-2 mt-1">
						{message.is_edited && <span className="text-xs opacity-70">(изменено)</span>}
						<span className="text-xs opacity-70">{time}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
