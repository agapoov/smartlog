import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts'
import type { Offer } from '@/features/offers'

interface OfferCoefficientPieChartProps {
	offers: Offer[]
	totalCoefficient: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF69B4']

export const OfferCoefficientPieChart = ({ offers }: OfferCoefficientPieChartProps) => {
	if (offers.length === 0) {
		return <div>Нет данных для отображения</div>
	}

	const data = offers.map((offer) => ({
		name: offer.carrier_name || `Оффер ${offer.id}`,
		value: offer.coefficient,
	}))

	return (
		<PieChart width={1000} height={400}>
			<Pie
				data={data}
				dataKey="value"
				nameKey="name"
				cx="50%"
				cy="50%"
				innerRadius={90}
				outerRadius={120}
				fill="#8884d8"
				label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(1)}%`}
			>
				{data.map((_, index) => (
					<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
				))}
			</Pie>
			<Tooltip formatter={(value: number) => `${value.toFixed(3)}`} />
			<Legend />
		</PieChart>
	)
}
