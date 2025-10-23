import { useState } from 'react'
import { AppLayout, Card, Space } from '@/shared/ui'
import { AppHeader } from '@/shared/ui/AppHeader'
import { useOrdersList } from '@/features/orders/hooks/orders.hooks'
// import { useResponsesList } from '@/features/offers'
import { Select } from '@/shared/ui'
import type { Order } from '@/features/orders'

const orderOptions = (ordersData: { data: Order | Order[] } | undefined) =>
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
	// const { data: responsesData, isLoading: isResponsesLoading } = useResponsesList({
	// 	order_id: selectedOrderId,
	// 	status: selectedStatus,
	// })

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
						<div>Таблица откликов будет добавлена после готовности API</div>
					</Card>
				</Space>
			</div>
		</AppLayout>
	)
}
