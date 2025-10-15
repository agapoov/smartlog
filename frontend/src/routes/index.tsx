import { authStore } from '@/features/auth'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Button, Card, Typography, Space } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { tokenService } from '@/shared/lib'
import { motion } from 'framer-motion'

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
		tokenService.clear()
		authStore.isAuthenticated = false
		navigate({ to: '/login' })
	}

	return (
		<motion.div
			animate={{
				opacity: [0, 1],
				y: [20, 0],
				transition: { ease: ['easeInOut'], duration: 0.5, when: 'beforeChildren', staggerChildren: 0.2 },
			}}
			className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
		>
			<motion.div
				animate={{ scale: [0.95, 1], opacity: [0, 1], transition: { ease: ['easeInOut'], duration: 0.6 } }}
				className="max-w-4xl mx-auto pt-8"
			>
				<Card className="shadow-lg rounded-2xl border-0">
					<Space direction="vertical" size="large" className="w-full">
						<motion.div
							animate={{ x: [-30, 0], opacity: [0, 1], transition: { ease: ['easeOut'], duration: 0.5 } }}
							className="flex items-center justify-between"
						>
							<motion.div
								animate={{
									scale: [0.8, 1],
									transition: { type: 'spring', stiffness: 100, damping: 12, duration: 0.7 },
								}}
								className="flex items-center space-x-3"
							>
								<motion.div
									animate={{
										rotate: [0, 15, -15, 0],
										opacity: [0, 1],
										transition: { duration: 0.8, ease: ['easeInOut'] },
									}}
									className="p-2 bg-indigo-100 rounded-full"
								>
									<UserOutlined className="text-indigo-600 text-xl" />
								</motion.div>
								<div>
									<Title level={2} className="!m-0">
										Добро пожаловать в систему
									</Title>
									<Text type="secondary">Вы успешно авторизованы</Text>
								</div>
							</motion.div>
							<motion.div animate={{ opacity: [0, 1], x: [30, 0], transition: { ease: ['easeIn'], duration: 0.4 } }}>
								<Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="rounded-lg">
									Выйти
								</Button>
							</motion.div>
						</motion.div>

						<motion.div
							animate={{
								opacity: [0, 1],
								transition: { ease: ['easeInOut'], duration: 0.5, delayChildren: 0.3, staggerChildren: 0.15 },
							}}
							className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
						>
							{['Быстрая загрузка', 'Code Splitting', 'Tree Shaking'].map((title, idx) => (
								<motion.div
									key={title}
									animate={{
										y: [20, 0],
										opacity: [0, 1],
										transition: { ease: ['easeOut'], duration: 0.4, delay: idx * 0.3 },
									}}
									className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
								>
									<Title level={4}>{title}</Title>
									<Text type="secondary">
										{title === 'Быстрая загрузка'
											? 'Оптимизированные бандлы'
											: title === 'Code Splitting'
												? 'Ленивая загрузка компонентов'
												: 'Удаление неиспользуемого кода'}
									</Text>
								</motion.div>
							))}
						</motion.div>

						<motion.div
							animate={{ opacity: [0, 1], y: [30, 0], transition: { ease: ['easeInOut'], duration: 0.5, delay: 0.6 } }}
							className="mt-8"
						>
							<Link to="/login">
								<Button type="link">Перейти к странице входа</Button>
							</Link>
						</motion.div>
					</Space>
				</Card>
			</motion.div>
		</motion.div>
	)
}
