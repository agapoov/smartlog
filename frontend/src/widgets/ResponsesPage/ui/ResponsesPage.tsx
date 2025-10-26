import { useState } from 'react'
import { AppLayout, Card, Space, Table } from '@/shared/ui'
import { AppHeader } from '@/shared/ui/AppHeader'
import { useOrdersList } from '@/features/orders/hooks/orders.hooks'
import { useResponsesList } from '@/features/offers'
import { Select } from '@/shared/ui'
import type { Order } from '@/features/orders'

export const orderOptions = (ordersData: { data: Order | Order[] } | undefined) =>
	ordersData
		? Array.isArray(ordersData.data)
			? ordersData.data.map((order) => ({
					label: `${order.start_address} - ${order.end_address}`,
					value: order.id,
				}))
			: [
					{
						label: `${ordersData.data.start_address} - ${ordersData.data.end_address}`,
						value: ordersData.data.id,
					},
				]
		: []

const statusOptions = [
	{ label: 'Ожидает 📥', value: 'pending' },
	{ label: 'Принято ✅', value: 'accepted' },
	{ label: 'Отклонено ❌', value: 'rejected' },
	{ label: 'Завершено 🎉', value: 'completed' },
]

export const ResponsesPage = () => {
	const { data: ordersData, isLoading: isOrdersLoading } = useOrdersList()
	const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(1)
	const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
	const { data: responsesData, isLoading: isResponsesLoading } = useResponsesList({
		order_id: selectedOrderId,
		status: selectedStatus,
	})

	const columns = [
		{
			title: 'Перевозчик',
			dataIndex: 'carrier_name',
			key: 'carrier_name',
		},
		{
			title: 'ИНН',
			dataIndex: 'carrier_inn',
			key: 'carrier_inn',
		},
		{
			title: 'Время доставки',
			dataIndex: 'offer_delivery_time',
			key: 'offer_delivery_time',
			render: (value: number) => (
				<>
					{value ? (
						<span className="whitespace-nowrap">
							{Math.floor(value) === value
								? `${Math.floor(value)}ч`
								: `${Math.floor(value)} ч ${Math.round((value % 1) * 60)} мин`}
						</span>
					) : (
						'-'
					)}
				</>
			),
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
		},
		{
			title: 'Маршрут',
			dataIndex: ['order_info', 'route'],
			key: 'route',
		},
		{
			title: 'Расстояние (км)',
			dataIndex: ['order_info', 'distance'],
			key: 'distance',
		},
		{
			title: 'Вес груза (кг)',
			dataIndex: ['order_info', 'cargo_weight'],
			key: 'cargo_weight',
		},
		{
			title: 'Создано',
			dataIndex: 'created_at',
			key: 'created_at',
			render: (text: string) => new Date(text).toLocaleString('ru-RU'),
		},
	]

	const tableData = responsesData?.responses || []
	const currentPage =
		responsesData?.filters.offset && responsesData?.filters.limit
			? Math.floor(responsesData.filters.offset / responsesData.filters.limit) + 1
			: 1

	return (
		<AppLayout>
			<div className="max-w-5xl mx-auto pt-8">
				<Space direction="vertical" size="large" className="w-full">
					<AppHeader showGoBack title="Отклики" />
					<Card
						title="Фильтры откликов"
						extra={
							<div className="flex gap-2">
								<Select
									loading={isOrdersLoading}
									value={selectedOrderId}
									onChange={setSelectedOrderId}
									options={orderOptions(ordersData)}
									placeholder="Выберите заказ"
									style={{ width: 300 }}
								/>
								<Select
									value={selectedStatus}
									onChange={setSelectedStatus}
									options={statusOptions}
									placeholder="Выберите статус"
									allowClear
									style={{ width: 200 }}
								/>
							</div>
						}
					>
						<Table
							columns={columns}
							dataSource={tableData}
							loading={isResponsesLoading}
							rowKey="response_id"
							pagination={{
								total: responsesData?.total_count,
								pageSize: responsesData?.filters.limit,
								current: currentPage,
							}}
						/>
					</Card>
				</Space>
			</div>
		</AppLayout>
	)
}
