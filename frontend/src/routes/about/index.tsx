import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppLayout } from '@/shared/ui'
import { Card, Typography, Space, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { AppHeader } from '@/shared/ui/AppHeader'

const { Paragraph } = Typography

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
					</Space>
				</Card>
			</div>
		</AppLayout>
	)
}
