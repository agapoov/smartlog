import { Modal, Input, Button, Upload, message, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { UploadFile } from 'antd/es/upload/interface'
import { useCreateChat, type IDtoCreateChat } from '@/features/chat'
import useToastStatus from '@/shared/utils/useToastStatus.utils'
import { useOrdersList } from '@/features/orders'
import { orderOptions } from '@/widgets/ResponsesPage/ui/ResponsesPage'
import { useGetAllUsers } from '@/features/chat/hooks/chat.hooks'
import type { IUser } from '@/features/chat/model/types'

interface IProps {
	isOpen: boolean
	onClose: () => void
}

export const ModalAddChat = ({ isOpen, onClose }: IProps) => {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [fileList, setFileList] = useState<UploadFile[]>([])
	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
	const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])

	const createMutation = useCreateChat()
	const { data: ordersData, isLoading: isOrdersLoading } = useOrdersList()
	const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers()
	const { status, error } = createMutation

	useToastStatus({ status, errorMsg: error?.message })

	const handleCreate = () => {
		if (!name.trim()) {
			message.error('Введите название чата')
			return
		}

		const payload: IDtoCreateChat = {
			name: name.trim(),
			description: description.trim(),
			order: selectedOrderId ? Number(selectedOrderId) : 0,
			logo: fileList[0]?.originFileObj ?? null,
			participant_ids: selectedUserIds, // 👈 передаём выбранных участников
		}

		createMutation.mutate(payload, {
			onSuccess: () => {
				message.success('Чат создан')
				handleClose()
			},
		})
	}

	const handleClose = () => {
		setName('')
		setDescription('')
		setSelectedOrderId(null)
		setFileList([])
		setSelectedUserIds([]) // сбрасываем участников
		onClose()
	}

	const userOptions =
		usersData?.map((user: IUser) => ({
			label: `${user.first_name} ${user.last_name || ''} (${user.username})`,
			value: user.id,
		})) ?? []

	return (
		<Modal
			open={isOpen}
			onCancel={handleClose}
			title="Создать новый чат"
			footer={[
				<Button key="cancel" onClick={handleClose}>
					Отмена
				</Button>,
				<Button key="submit" type="primary" onClick={handleCreate} loading={createMutation.isPending}>
					Создать
				</Button>,
			]}
			width={480}
			centered
		>
			<div className="space-y-4 py-4">
				{/* Название */}
				<div className="space-y-2">
					<label className="text-sm font-medium block">Название чата</label>
					<Input placeholder="Чат по заказу #123" value={name} onChange={(e) => setName(e.target.value)} />
				</div>

				{/* Описание */}
				<div className="space-y-2">
					<label className="text-sm font-medium block">Описание</label>
					<TextArea
						placeholder="Краткое описание чата..."
						rows={3}
						className="resize-none"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Заказ */}
				<div className="space-y-2">
					<label className="text-sm font-medium block">Заказ (опционально)</label>
					<Select
						loading={isOrdersLoading}
						value={selectedOrderId}
						onChange={setSelectedOrderId}
						options={orderOptions(ordersData)}
						placeholder="Выберите заказ"
						style={{ width: '100%' }}
					/>
				</div>

				{/* Участники */}
				<div className="space-y-2">
					<label className="text-sm font-medium block">Участники</label>
					<Select
						mode="multiple"
						loading={isUsersLoading}
						value={selectedUserIds}
						onChange={setSelectedUserIds}
						options={userOptions}
						placeholder="Выберите участников"
						style={{ width: '100%' }}
						showSearch
						optionFilterProp="label"
					/>
				</div>

				{/* Логотип */}
				<div className="space-y-2">
					<label className="text-sm font-medium block">Логотип (опционально)</label>
					<Upload
						fileList={fileList}
						onRemove={() => setFileList([])}
						beforeUpload={(file) => {
							setFileList([file])
							return false
						}}
						maxCount={1}
					>
						<Button icon={<UploadOutlined />}>Загрузить изображение</Button>
					</Upload>
				</div>
			</div>
		</Modal>
	)
}
