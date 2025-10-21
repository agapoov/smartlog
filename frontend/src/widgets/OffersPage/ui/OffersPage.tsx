import { useMemo, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { AppLayout, Button, Card, Space, Table } from '@/shared/ui'
import { AppHeader } from '@/shared/ui/AppHeader'
import { useFindOffers, useRespondOffer, type Offer } from '@/features/offers'
import { Descriptions, Segmented } from 'antd'
import { useOrdersById } from '@/features/orders/hooks/orders.hooks'
import { OfferCoefficientPieChart } from './OfferCoefficientPieChart'
import { OfferPriceBarChart } from './OfferPriceBarChart'
import useToastStatus from '@/shared/utils/useToastStatus'

export const OffersPage = () => {
	const { id: orderId } = useParams({ from: '/offers/$id' })
	const { data: offersData, isLoading: isOffersLoading } = useFindOffers({ order_id: Number(orderId) })
	const { data: orderItem } = useOrdersById(Number(orderId))
	const { mutate: respondOffer, isPending: isResponding, status, error } = useRespondOffer()
	const [activeTab, setActiveTab] = useState('Таблица')
	useToastStatus({ status, errorMsg: error })
	const columns = useMemo(
		() => [
			{ title: 'ID', dataIndex: 'id', key: 'id' },
			{ title: 'Перевозчик', dataIndex: 'carrier_name', key: 'carrier_name' },
			{ title: 'ИНН', dataIndex: 'carrier_inn', key: 'carrier_inn' },
			{
				title: 'Рейтинг',
				dataIndex: 'carrier_rating',
				key: 'carrier_rating',
				render: (value: number) => (value ? value.toFixed(1) : '-'),
			},
			{
				title: 'Цена, ₽',
				dataIndex: 'price',
				key: 'price',
				render: (value: number) => (value ? value.toFixed(2) : '-'),
			},
			{
				title: 'Время доставки, ч',
				dataIndex: 'delivery_time',
				key: 'delivery_time',
				render: (value: number) => (value ? value.toFixed(1) : '-'),
			},
			{
				title: 'Коэффициент',
				dataIndex: 'coefficient',
				key: 'coefficient',
				render: (value: number) => (value ? value.toFixed(3) : '-'),
			},
			{
				title: 'Действия',
				key: 'actions',
				render: (_: unknown, record: Offer) => (
					<Button
						type="primary"
						loading={isResponding}
						disabled={isResponding}
						onClick={() => respondOffer({ order_id: Number(orderId), offer_id: record.id })}
					>
						Откликнуться
					</Button>
				),
			},
		],
		[orderId, isResponding, respondOffer],
	)

	return (
		<AppLayout>
			<div className="max-w-5xl mx-auto pt-8">
				<Space direction="vertical" size="large" className="w-full">
					<AppHeader
						showGoBack
						title={`Предложения для заказа ${orderItem?.data?.start_address} - ${orderItem?.data?.end_address}`}
					/>
					{offersData?.order_info && (
						<Card title="Информация о заказе">
							<Descriptions>
								<Descriptions.Item label="Маршрут">{offersData.order_info.route}</Descriptions.Item>
								<Descriptions.Item label="Расстояние, км">
									{offersData.order_info.distance.toFixed(1)}
								</Descriptions.Item>
								<Descriptions.Item label="Вес груза, кг">
									{offersData.order_info.cargo_weight.toFixed(1)}
								</Descriptions.Item>
								<Descriptions.Item label="Объем груза, м³">
									{offersData.order_info.cargo_volume.toFixed(1)}
								</Descriptions.Item>
							</Descriptions>
						</Card>
					)}
					<Card title="Список предложений">
						<Segmented
							value={activeTab}
							onChange={(value) => setActiveTab(value as string)}
							options={['Таблица', 'Диаграмма коэффициента', 'Диаграмма цены']}
							style={{ marginBottom: 16 }}
						/>
						{activeTab === 'Таблица' && (
							<Table
								rowKey={(r: Offer) => r.id}
								loading={isOffersLoading}
								columns={columns}
								dataSource={offersData?.offers}
								pagination={false}
							/>
						)}
						{activeTab === 'Диаграмма коэффициента' && (
							<div style={{ height: 400 }}>
								<OfferCoefficientPieChart
									offers={offersData?.offers || []}
									totalCoefficient={offersData?.total_coefficient || 0}
								/>
							</div>
						)}
						{activeTab === 'Диаграмма цены' && (
							<div style={{ height: 400 }}>
								<OfferPriceBarChart offers={offersData?.offers || []} />
							</div>
						)}
					</Card>
				</Space>
			</div>
		</AppLayout>
	)
}
