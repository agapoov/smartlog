import { useCargoList, type Cargo } from '@/features/cargo'
import { useCreateOrders, type CreateOrdersRequest } from '@/features/orders'
import { Form, Input, Modal, Select, DatePicker } from 'antd'
import { useMemo, type FC } from 'react'
import dayjs from 'dayjs'

interface IProps {
	open: boolean
	setOpen: (state: boolean) => void
}

export const ModalOrderAdd: FC<IProps> = ({ open, setOpen }) => {
	const [form] = Form.useForm<CreateOrdersRequest>()

	const { data: cargoData, isLoading: isCargoLoading } = useCargoList()
	const createMutation = useCreateOrders()

	const cargoOptions = useMemo(
		() =>
			cargoData?.data.map((cargo: Cargo) => ({
				label: `${cargo.name} (${cargo.cargo_type}, ${cargo.cargo_weight} кг, ${cargo.cargo_volume} м³)`,
				value: cargoData.data.indexOf(cargo) + 1,
			})) || [],
		[cargoData],
	)

	const handleCreate = async () => {
		try {
			const values = await form.validateFields()
			// Преобразуем loading_date из dayjs в ISO 8601
			values.loading_date = dayjs(values.loading_date).toISOString()
			await createMutation.mutateAsync(values)
			form.resetFields()
			setOpen(false)
		} catch (err) {
			console.log('errOrderAdd', err)
		}
	}

	return (
		<Modal
			open={open}
			title="Создать заказ"
			onOk={handleCreate}
			okText="Создать"
			confirmLoading={createMutation.isPending}
			onCancel={() => setOpen(false)}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					label="Начальный адрес"
					name="start_address"
					rules={[{ required: true, message: 'Укажите начальный адрес' }]}
				>
					<Input placeholder="Например: Белгород" />
				</Form.Item>
				<Form.Item
					label="Конечный адрес"
					name="end_address"
					rules={[{ required: true, message: 'Укажите конечный адрес' }]}
				>
					<Input placeholder="Например: Москва" />
				</Form.Item>

				<Form.Item
					label="Дата загрузки"
					name="loading_date"
					rules={[{ required: true, message: 'Укажите дату загрузки' }]}
				>
					<DatePicker
						showTime
						format="DD.MM.YYYY HH:mm"
						placeholder="Выберите дату и время"
						style={{ width: '100%' }}
						disabledDate={(current) => current && current < dayjs().startOf('day')}
					/>
				</Form.Item>
				<Form.Item label="Цена, ₽" name="price" rules={[{ required: true, message: 'Укажите цену' }]}>
					<Input type="number" min={0} placeholder="Например: 100" />
				</Form.Item>
				<Form.Item label="Груз" name="cargo" rules={[{ required: true, message: 'Выберите груз' }]}>
					<Select
						options={cargoOptions}
						placeholder="Выберите груз"
						loading={isCargoLoading}
						disabled={isCargoLoading || !cargoOptions.length}
					/>
				</Form.Item>
			</Form>
		</Modal>
	)
}
