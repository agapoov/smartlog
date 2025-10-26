import { Modal, Input, Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'

interface IProps {
	isOpen: boolean
	onClose: () => void
}

export const ModalAddChat = ({ isOpen, onClose }: IProps) => {
	return (
		<Modal
			open={isOpen}
			onCancel={onClose}
			title="Создать новый чат"
			footer={[
				<Button key="cancel" onClick={onClose}>
					Отмена
				</Button>,
				<Button key="submit" type="primary" onClick={onClose}>
					Создать
				</Button>,
			]}
			width={480}
			centered
		>
			<div className="space-y-4 py-4">
				<div className="space-y-2">
					<label className="text-sm font-medium block">Название чата</label>
					<Input placeholder="Чат по заказу #123" />
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium block">Описание</label>
					<TextArea placeholder="Краткое описание чата..." rows={3} className="resize-none" />
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium block">Заказ (опционально)</label>
					<Input placeholder="#123" type="number" />
				</div>
			</div>
		</Modal>
	)
}
