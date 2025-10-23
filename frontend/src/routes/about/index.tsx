import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppLayout } from '@/shared/ui'
import { Card, Typography, Space, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { AppHeader } from '@/shared/ui/AppHeader'

const { Paragraph, Title } = Typography

export const Route = createFileRoute('/about/')({
	component: AboutPage,
})

function AboutPage() {
	const navigate = useNavigate()

	const handleGoBack = () => {
		navigate({ to: '/' })
	}
	return (
		<AppLayout>
			<div className="max-w-4xl mx-auto pt-8">
				<Button type="text" icon={<ArrowLeftOutlined />} onClick={handleGoBack} className="text-[16px] mb-3">
					Назад
				</Button>
				<Card className="shadow-lg rounded-2xl border-0">
					<Space direction="vertical" size="large" className="w-full">
						<AppHeader title="О нас" />
						<Paragraph>
							Добро пожаловать в нашу систему управления заказами. Мы предоставляем современные решения для эффективного
							управления грузоперевозками.
						</Paragraph>
						<Paragraph>
							Наша платформа позволяет легко создавать, отслеживать и управлять заказами в режиме реального времени.
						</Paragraph>
						<Title level={4}>Краткое руководство пользователя</Title>
						<Paragraph>
							Для создания заказа укажите: начальный и конечный адрес (например, Белгород → Москва), объем груза (м³),
							вес (тн или кг), расстояние (км) и срок доставки (дни). После создания вы сможете просматривать отклики
							перевозчиков с данными о перевозчике, ИНН, рейтинге, цене, времени доставки и маршруте. Используйте
							фильтры для поиска подходящих предложений и кнопку "Откликнуться" для принятия.
						</Paragraph>
					</Space>
				</Card>
			</div>
		</AppLayout>
	)
}
