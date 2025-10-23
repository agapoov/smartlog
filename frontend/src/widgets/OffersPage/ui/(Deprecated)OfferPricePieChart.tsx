import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts'
import type { Offer } from '@/features/offers'

interface OfferPricePieChartProps {
	offers: Offer[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF69B4']

export const OfferPricePieChart = ({ offers }: OfferPricePieChartProps) => {
	if (offers.length === 0) {
		return <div>Нет данных для отображения</div>
	}

	const data = offers.map((offer) => ({
		name: offer.carrier_name || `Оффер ${offer.id}`,
		value: offer.price,
	}))

	return (
		<PieChart width={1000} height={450}>
			<Pie
				data={data}
				dataKey="value"
				nameKey="name"
				cx="50%"
				cy="50%"
				outerRadius={150}
				fill="#8884d8"
				label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
			>
				{data.map((_, index) => (
					<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
				))}
			</Pie>
			<Tooltip formatter={(value: number) => `${value.toFixed(2)} ₽`} />
			<Legend />
		</PieChart>
	)
}
