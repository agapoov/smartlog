import { useMemo, useState } from 'react'
import { AppLayout, Button, Card, Form, Input, Modal, Select, Space, Table, Typography } from '@/shared/ui'
import { useCargoList, useCreateCargo, CargoType, type CreateCargoRequest, type Cargo } from '@/shared/api'

const { Title } = Typography

const cargoTypeOptions = Object.values(CargoType).map((value) => ({ label: value, value }))

export const CargoPage = () => {
	const { data, isLoading } = useCargoList()
	const createMutation = useCreateCargo()
	const [open, setOpen] = useState(false)
	const [form] = Form.useForm<CreateCargoRequest>()

	const columns = useMemo(
		() => [
			{ title: 'Имя', dataIndex: 'name', key: 'name' },
			{ title: 'Тип', dataIndex: 'cargo_type', key: 'cargo_type' },
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
		} catch {
			// валидация уже подсветит поля
		}
	}

	return (
		<AppLayout>
			<div className="max-w-5xl mx-auto pt-8">
				<Space direction="vertical" size="large" className="w-full">
					<Title level={2} className="!m-0">
						Грузы
					</Title>
					<Card
						title="Список грузов"
						extra={
							<Button type="primary" onClick={() => setOpen(true)}>
								Создать груз
							</Button>
						}
					>
						<Table<Cargo>
							rowKey={(r: Cargo) => `${r.name}-${r.cargo_type}-${r.cargo_weight}-${r.cargo_volume}`}
							loading={isLoading}
							columns={columns}
							dataSource={data?.data ?? []}
							pagination={false}
						/>
					</Card>
				</Space>
			</div>

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
						<Input type="number" min={0} />
					</Form.Item>
					<Form.Item label="Объём, м³" name="cargo_volume" rules={[{ required: true, message: 'Укажите объём' }]}>
						<Input type="number" min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</AppLayout>
	)
}
