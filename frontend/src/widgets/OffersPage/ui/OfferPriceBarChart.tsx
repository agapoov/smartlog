import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import type { Offer } from '@/features/offers'

interface OfferPriceBarChartProps {
	offers: Offer[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF69B4']

export const OfferPriceBarChart = ({ offers }: OfferPriceBarChartProps) => {
	if (offers.length === 0) {
		return <div>Нет данных для отображения</div>
	}

	const data = offers.map((offer, index) => ({
		name: offer.carrier_name || `Оффер ${offer.id}`,
		price: offer.price,
		fill: COLORS[index % COLORS.length], // Добавляем цвет для каждого оффера
	}))

	return (
		<BarChart width={1000} height={400} data={data}>
			<XAxis dataKey="name" angle={-10} textAnchor="end" interval={0} height={60} />
			<YAxis />
			<Tooltip formatter={(value: number) => `${value.toFixed(2)} ₽`} />
			<Legend />
			<Bar dataKey="price" fill="#8884d8" /> {/* Базовый цвет, переопределяется через данные */}
		</BarChart>
	)
}
