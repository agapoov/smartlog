import type { IChat } from '@/features/chat'
import { useGetAllUsers, useRemoveMember, useGetChatById } from '@/features/chat/hooks/chat.hooks'
import type { IUser } from '@/features/chat/model/types'
import { Modal, Select, Spin, Typography, Button } from 'antd'
import { useState, type FC, useEffect } from 'react'
import { DeleteOutlined } from '@ant-design/icons'
import useToastStatus from '@/shared/utils/useToastStatus.utils'

const { Text } = Typography

interface ChatParticipantsModalProps {
	chat: IChat | null
	open: boolean
	onClose: () => void
	onAddParticipants: (userIds: number[]) => void
}

export const ModalAddMembers: FC<ChatParticipantsModalProps> = ({
	chat: initialChat,
	open,
	onClose,
	onAddParticipants,
}) => {
	const chatId = initialChat?.id
	const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])

	const { data: chat, isLoading: isChatLoading } = useGetChatById(chatId || '', {
		enabled: open && !!chatId,
	})

	const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers()
	const removeMember = useRemoveMember(chatId!)

	const userOptions =
		usersData?.map((user: IUser) => ({
			label: `${user.first_name} ${user.last_name || ''} (${user.username})`,
			value: user.id,
			disabled: chat?.participants.some((p) => p.user.id === user.id),
		})) ?? []

	const handleOk = () => {
		if (selectedUserIds.length > 0) {
			onAddParticipants(selectedUserIds)
		}
		onClose()
	}

	const handleRemoveParticipant = (userId: number) => {
		if (!chatId) return

		removeMember.mutateAsync(userId)
	}

	// Очистка при закрытии
	useEffect(() => {
		if (!open) {
			setSelectedUserIds([])
		}
	}, [open])

	useToastStatus({
		status: removeMember.status,
		errorMsg: removeMember.error,
	})

	if (!chatId || !chat) {
		return null
	}

	return (
		<Modal
			title="Участники чата"
			open={open}
			onCancel={onClose}
			onOk={handleOk}
			okText="Добавить"
			cancelText="Отмена"
			width={500}
			confirmLoading={removeMember.isPending}
		>
			<div className="space-y-6">
				{/* === ТЕКУЩИЕ УЧАСТНИКИ === */}
				<div>
					<Text strong>Текущие участники ({chat.participants.length})</Text>
					{isChatLoading ? (
						<div className="py-4 text-center">
							<Spin size="small" />
						</div>
					) : (
						<div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
							{chat.participants.map((p) => (
								<div
									key={p.user.id}
									className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div>
											<Text strong>{`${p.user.first_name} ${p.user.last_name || ''}`}</Text>
											<Text type="secondary" className="block text-xs">
												@{p.user.username}
											</Text>
										</div>
									</div>

									<Button
										type="text"
										danger
										size="small"
										icon={<DeleteOutlined />}
										onClick={() => handleRemoveParticipant(p.user.id)}
										loading={removeMember.isPending}
										disabled={removeMember.isPending}
									/>
								</div>
							))}
						</div>
					)}
				</div>

				{/* === ДОБАВИТЬ УЧАСТНИКОВ === */}
				<div className="space-y-2">
					<Text strong>Добавить участников</Text>
					<Select
						mode="multiple"
						loading={isUsersLoading}
						value={selectedUserIds}
						onChange={setSelectedUserIds}
						options={userOptions}
						placeholder="Поиск по имени или @username"
						style={{ width: '100%' }}
						showSearch
						optionFilterProp="label"
						notFoundContent={isUsersLoading ? <Spin size="small" /> : 'Нет пользователей'}
					/>
				</div>
			</div>
		</Modal>
	)
}
