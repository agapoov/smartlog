import { authStore } from '@/features/auth'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, Card, Typography, Space } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { tokenService } from '@/shared/lib'
import { AppLayout } from '@/shared/ui'

const { Title, Text } = Typography

export const Route = createFileRoute('/')({
	component: RouteComponent,
	beforeLoad: async () => {
		// if (!authStore.isAuthenticated) {
		// 	throw redirect({ to: '/login' })
		// }
	},
})

function RouteComponent() {
	const navigate = useNavigate()

	const handleLogout = () => {
		tokenService.clear()
		authStore.isAuthenticated = false
		navigate({ to: '/login' })
	}

	const handleNavigateTo = (to: string) => {
		navigate({ to })
	}

	return (
		<AppLayout>
			<div className="max-w-4xl mx-auto pt-8">
				<Card className="shadow-lg rounded-2xl border-0 cursor-pointer">
					<Space direction="vertical" size="large" className="w-full">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-indigo-100 rounded-full">
									<UserOutlined className="text-indigo-600 text-xl" />
								</div>
								<div>
									<Title level={2} className="!m-0">
										Добро пожаловать в систему
									</Title>
									<Text type="secondary">Вы успешно авторизованы</Text>
									<Link to="/about">
										<Button type="link">О нас</Button>
									</Link>
								</div>
							</div>
							<Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="rounded-lg">
								Выйти
							</Button>
						</div>
						<Card onClick={() => handleNavigateTo('/cargo')} hoverable>
							<Title level={4}>Грузы</Title>
							<Text type="secondary">Перейти в отображение и создание Грузов</Text>
						</Card>

						<Card onClick={() => handleNavigateTo('/orders')} hoverable>
							<Title level={4}>Заказы</Title>
							<Text type="secondary">Перейти в отображение и создание заказов</Text>
						</Card>
					</Space>
				</Card>
			</div>
		</AppLayout>
	)
}
