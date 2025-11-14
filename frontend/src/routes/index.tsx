import { authStore } from '@/features/auth'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Button, Card, Typography, Space } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { BulbFilled } from '@ant-design/icons'
import { MainLayout } from '@/shared/ui/MainLayout'
import { useMenuItems } from '@/shared/hooks'
import type { MenuItem } from '@/shared/hooks/useMenuItems'

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
	const menuItems = useMenuItems()

	const handleLogout = async () => {
		await authStore.logout()
	}

	const handleNavigateTo = (to: string) => {
		navigate({ to })
	}

	return (
		<MainLayout>
			<Space direction="vertical" size="large" className="w-full px-6">
				<div className="flex items-center justify-between">
					<div className="flex items-start space-x-3">
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

				{menuItems.slice(1).map((item: MenuItem) => (
					<Card
						key={item.to}
						onClick={() => handleNavigateTo(item.to)}
						className="pc-12 cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
					>
						<div className="flex flex-row gap-5 items-center p-4">
							<span className="text-3xl text-gray-700">{item.icon}</span>
							<div>
								<label className="text-lg font-bold">{item.label}</label>
								<Text type="secondary" className="block mt-1">
									{item.description}
								</Text>
							</div>
						</div>
					</Card>
				))}
			</Space>
		</MainLayout>
	)
}
