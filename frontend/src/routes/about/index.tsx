import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/shared/ui'
import { Card, Typography, Space } from 'antd'

const { Title, Paragraph } = Typography

export const Route = createFileRoute('/about/')({
	component: AboutPage,
})

function AboutPage() {
	return (
		<AppLayout>
			<div className="max-w-4xl mx-auto pt-8">
				<Card className="shadow-lg rounded-2xl border-0">
					<Space direction="vertical" size="large" className="w-full">
						<Title level={1}>О нас</Title>
						<Paragraph>
							Добро пожаловать в нашу систему управления заказами. Мы предоставляем современные решения для эффективного
							управления грузоперевозками.
						</Paragraph>
						<Paragraph>
							Наша платформа позволяет легко создавать, отслеживать и управлять заказами в режиме реального времени.
						</Paragraph>
					</Space>
				</Card>
			</div>
		</AppLayout>
	)
}
