import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AppLayout, Button, Card, Space, Table } from '@/shared/ui'
import { useOrdersList } from '@/features/orders'
import type { Order } from '@/features/orders/model/types'
import { ModalOrderAdd } from './ModalOrderAdd'
import dayjs from 'dayjs'
import { AppHeader } from '@/shared/ui/AppHeader'

export const OrdersPage = () => {
	const { data: ordersData, isLoading: isOrdersLoading } = useOrdersList()

	const [open, setOpen] = useState(false)

	const columns = useMemo(
		() => [
			{ title: 'ID', dataIndex: 'id', key: 'id' },
			{ title: 'Начальный адрес', dataIndex: 'start_address', key: 'start_address' },
			{ title: 'Конечный адрес', dataIndex: 'end_address', key: 'end_address' },
			{
				title: 'Расстояние, км',
				dataIndex: 'distance',
				key: 'distance',
				render: (value: number) => (value ? value.toFixed(1) : '-'),
			},
			{
				title: 'Длительность, ч',
				dataIndex: 'duration',
				key: 'duration',
				render: (value: number) => (value ? value.toFixed(1) : '-'),
			},
			{
				title: 'Дата загрузки',
				dataIndex: 'loading_date',
				key: 'loading_date',
				render: (value: string) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '-'),
			},
			{ title: 'Цена, ₽', dataIndex: 'price', key: 'price' },
			{ title: 'ID груза', dataIndex: 'cargo', key: 'cargo' },
			{
				title: 'Действия',
				key: 'actions',
				render: (_: unknown, record: Order) => (
					<Link to="/offers/$id" params={{ id: String(record.id) }}>
						<Button type="link">Предложения</Button>
					</Link>
				),
			},
		],
		[],
	)

	return (
		<AppLayout>
			<div className="max-w-5xl mx-auto pt-8">
				<Space direction="vertical" size="large" className="w-full">
					<AppHeader showGoBack title="Заказы" />
					<Card
						title="Список заказов"
						extra={
							<Button type="primary" onClick={() => setOpen(true)}>
								Создать заказ
							</Button>
						}
					>
						<Table<Order>
							rowKey={(r: Order) => r.id}
							loading={isOrdersLoading}
							columns={columns}
							dataSource={ordersData?.data as Order[]}
							pagination={false}
						/>
					</Card>
				</Space>
			</div>

			<ModalOrderAdd open={open} setOpen={setOpen} />
		</AppLayout>
	)
}
