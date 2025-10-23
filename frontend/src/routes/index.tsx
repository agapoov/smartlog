import { authStore } from '@/features/auth'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Button, Card, Typography, Space } from 'antd'
import {
	DollarCircleOutlined,
	LogoutOutlined,
	OrderedListOutlined,
	TruckOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { tokenService } from '@/shared/lib'
import { AppLayout } from '@/shared/ui'
import { BulbFilled } from '@ant-design/icons' // Replaced with BulbFilled

const { Title, Text } = Typography

export const Route = createFileRoute('/')({
	component: RouteComponent,
	beforeLoad: async () => {
		if (!authStore.isAuthenticated) {
			throw redirect({ to: '/login' })
		}
	},
})

function RouteComponent() {
	const navigate = useNavigate()

	const handleLogout = () => {
		authStore.isAuthenticated = false
		tokenService.clear()
		window.location.href = '/login'
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
								</div>
							</div>
							<div className="flex gap-5">
								<Link to="/about">
									<Button icon={<BulbFilled />}>О нас</Button>
								</Link>
								<Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="rounded-lg">
									Выйти
								</Button>
							</div>
						</div>
						<Card onClick={() => handleNavigateTo('/cargo')} hoverable>
							<div className="flex flex-row gap-5 items-start">
								<TruckOutlined className="text-4xl" />
								<Title level={4}>Грузы</Title>
								<Text type="secondary">Перейти в отображение и создание Грузов</Text>
							</div>
						</Card>

						<Card onClick={() => handleNavigateTo('/orders')} hoverable>
							<div className="flex flex-row gap-5 items-start">
								<OrderedListOutlined className="text-3xl" />
								<Title level={4}>Заказы</Title>
								<Text type="secondary">Перейти в отображение и создание заказов</Text>
							</div>
						</Card>
						<Card onClick={() => handleNavigateTo('/responses')} hoverable>
							<div className="flex flex-row gap-5 items-start">
								<DollarCircleOutlined className="text-3xl" />
								<Title level={4}>Отклики</Title>
								<Text type="secondary" className="mt-1">
									Перейти в отображение откликов
								</Text>
							</div>
						</Card>
					</Space>
				</Card>
			</div>
		</AppLayout>
	)
}
