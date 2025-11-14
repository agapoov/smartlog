import { useMemo, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { Button, Card, Space, Table } from '@/shared/ui'
import { useFindOffers, useRespondOffer, type Offer } from '@/features/offers'
import { Descriptions, Segmented, Tooltip } from 'antd'
import { useOrdersById } from '@/features/orders/hooks/orders.hooks'
import { OfferCoefficientPieChart } from './OfferCoefficientPieChart'
import { OfferPriceBarChart } from './OfferPriceBarChart'
import useToastStatus from '@/shared/utils/useToastStatus.utils'
import { HideableTooltip } from './HideableTooltip'
import { MainLayout } from '@/shared/ui/MainLayout'

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
				render: (value: number, record: Offer) => (
					<Tooltip title={record.coefficient_breakdown.explanation.rating || 'Нет пояснения'}>
						{value ? value.toFixed(1) : '-'}
					</Tooltip>
				),
			},
			{
				title: 'Цена',
				dataIndex: 'price',
				key: 'price',
				render: (value: number, record: Offer) => (
					<Tooltip title={record.coefficient_breakdown.explanation.price || 'Нет пояснения'}>
						{value ? <span className="whitespace-nowrap">{Math.round(value).toLocaleString('ru-RU')} ₽</span> : '-'}
					</Tooltip>
				),
			},
			{
				title: 'Время доставки',
				dataIndex: 'delivery_time',
				key: 'delivery_time',
				render: (value: number, record: Offer) => (
					<Tooltip title={record.coefficient_breakdown.explanation.time || 'Нет пояснения'}>
						{value ? (
							<span className="whitespace-nowrap">
								{Math.floor(value) === value
									? `${Math.floor(value)}ч`
									: `${Math.floor(value)} ч ${Math.round((value % 1) * 60)} мин`}
							</span>
						) : (
							'-'
						)}
					</Tooltip>
				),
			},
			{
				title: 'Надежность',
				dataIndex: 'reliability_score',
				key: 'reliability_score',
				render: (value: number, record: Offer) => (
					<Tooltip title={record.coefficient_breakdown.explanation.reliability || 'Нет пояснения'}>
						{value ? value.toFixed(1) : '-'}
					</Tooltip>
				),
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
		<MainLayout
			title={`Предложения для заказа ${orderItem?.data?.start_address} - ${orderItem?.data?.end_address}`}
			showGoBack
		>
			<HideableTooltip text="Наведитесь на значение столбцов, чтобы получить их объяснение." />
			<Space direction="vertical" size="large" className="w-full">
				{offersData?.order_info && (
					<Card title="Информация о заказе">
						<Descriptions>
							<Descriptions.Item label="Маршрут">{offersData.order_info.route}</Descriptions.Item>
							<Descriptions.Item label="Расстояние, км">{offersData.order_info.distance.toFixed(1)}</Descriptions.Item>
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
							scroll={{ x: 'maxContent' }}
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
		</MainLayout>
	)
}
