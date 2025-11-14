// widgets/CargoPage.tsx
import { useMemo, useState } from 'react'
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from 'antd'
import { useCargoList, useCreateCargo, CargoType, type CreateCargoRequest, type Cargo } from '@/shared/api'
import { MainLayout } from '@/shared/ui/MainLayout' // ← новый лейаут
import { getCargoTypeDisplay } from '@/shared/utils/cargoType.utils'

const cargoTypeOptions = Object.values(CargoType).map((value) => {
	const { label, tagColor } = getCargoTypeDisplay(value)
	return { label: <Tag color={tagColor}>{label}</Tag>, value }
})

export const CargoPage = () => {
	const { data, isLoading } = useCargoList()
	const createMutation = useCreateCargo()
	const [open, setOpen] = useState(false)
	const [form] = Form.useForm<CreateCargoRequest>()

	const renderCargoType = (value: CargoType) => {
		const { label, tagColor } = getCargoTypeDisplay(value)
		return <Tag color={tagColor}>{label}</Tag>
	}

	const columns = useMemo(
		() => [
			{ title: 'Имя', dataIndex: 'name', key: 'name' },
			{ title: 'Тип', dataIndex: 'cargo_type', key: 'cargo_type', render: renderCargoType },
			{ title: 'Вес, кг', dataIndex: 'cargo_weight', key: 'cargo_weight' },
			{ title: 'Объём, м³', dataIndex: 'cargo_volume', key: 'cargo_volume' },
		],
		[],
	)

	const handleCreate = async () => {
		try {
			const values = await form.validateFields()
			await createMutation.mutateAsync(values)
			form.resetFields()
			setOpen(false)
		} catch (err) {
			console.log('errModalAdd cargo', err)
		}
	}

	return (
		<MainLayout title="Грузы" showGoBack>
			<Space direction="vertical" size="large" className="w-full">
				<Card
					title="Список грузов"
					extra={
						<Button type="primary" onClick={() => setOpen(true)}>
							Создать груз
						</Button>
					}
				>
					<Table<Cargo>
						rowKey={(r) => `${r.name}-${r.cargo_type}-${r.cargo_weight}-${r.cargo_volume}`}
						loading={isLoading}
						columns={columns}
						dataSource={data?.data as Cargo[]}
						pagination={false}
					/>
				</Card>
			</Space>

			<Modal
				open={open}
				title="Создать груз"
				onOk={handleCreate}
				okText="Создать"
				confirmLoading={createMutation.isPending}
				onCancel={() => setOpen(false)}
			>
				<Form form={form} layout="vertical">
					<Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Укажите имя' }]}>
						<Input placeholder="Например: Груз 1" />
					</Form.Item>
					<Form.Item label="Тип груза" name="cargo_type" rules={[{ required: true, message: 'Выберите тип' }]}>
						<Select options={cargoTypeOptions} placeholder="Выберите тип" />
					</Form.Item>
					<Form.Item label="Вес, кг" name="cargo_weight" rules={[{ required: true, message: 'Укажите вес' }]}>
						<Input type="number" min={0} placeholder="Например: 18" />
					</Form.Item>
					<Form.Item label="Объём, м³" name="cargo_volume" rules={[{ required: true, message: 'Укажите объём' }]}>
						<Input type="number" min={0} placeholder="Например: 11.7" />
					</Form.Item>
				</Form>
			</Modal>
		</MainLayout>
	)
}
