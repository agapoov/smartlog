import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useAuthMutation, type LoginFormData } from '@/features/auth'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'

const { Title, Text } = Typography

export const LoginForm = () => {
	const [form] = Form.useForm<LoginFormData>()

	const { isPending, error } = useAuthMutation()
	const navigate = useNavigate()

	const onSubmit = async () => {
		// handleLogin({
		// 	values,
		// 	mutateAsync,
		// 	navigate,
		// })
		setTimeout(() => {
			navigate({ to: '/cargo/index/cargo' })
		}, 500)
	}

	return (
		<motion.div
			animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'], duration: 0.2 } }}
			className="min-h-screen flex items-center justify-center p-5"
			style={{
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			}}
		>
			<motion.div
				animate={{ opacity: [0, 1], scale: [0.93, 1], transition: { ease: ['easeIn', 'easeOut'], duration: 0.6 } }}
				className="w-full max-w-sm"
			>
				<Card
					className="w-full border-none"
					style={{
						boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
						borderRadius: '16px',
						backdropFilter: 'blur(10px)',
					}}
					styles={{ body: { padding: '40px 32px' } }}
				>
					<Space direction="vertical" size="large" className="w-full">
						<motion.div
							animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}
							className="text-center"
						>
							<motion.div
								animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}
								className="inline-block mb-4 p-4 rounded-full text-white"
								style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								}}
							>
								<LoginOutlined className="text-2xl" />
							</motion.div>
							<Title level={2} className="!m-0 !text-gray-800">
								Добро пожаловать
							</Title>
							<Text type="secondary" className="text-base">
								Войдите в свой аккаунт
							</Text>
						</motion.div>

						<AnimatePresence>
							{error && (
								<motion.div animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}>
									<Alert
										message={error.message}
										type="error"
										icon={<ExclamationCircleOutlined />}
										showIcon
										closable
										className="rounded-lg"
									/>
								</motion.div>
							)}
						</AnimatePresence>

						<motion.div animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}>
							<Form form={form} name="login" onFinish={onSubmit} autoComplete="off" size="large">
								<motion.div animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}>
									<Form.Item
										name="username"
										rules={[
											{ required: true, message: 'Пожалуйста, введите имя пользователя!' },
											{ min: 3, message: 'Имя пользователя должно содержать минимум 3 символа' },
										]}
									>
										<Input
											prefix={<UserOutlined style={{ color: '#667eea' }} />}
											placeholder="Имя пользователя"
											className="rounded-lg h-11 border-gray-200 transition-all duration-300 ease-in-out focus:border-indigo-500"
										/>
									</Form.Item>
								</motion.div>

								<motion.div animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}>
									<Form.Item
										name="password"
										rules={[
											{ required: true, message: 'Пожалуйста, введите пароль!' },
											{ min: 6, message: 'Пароль должен содержать минимум 6 символов' },
										]}
									>
										<Input.Password
											prefix={<LockOutlined style={{ color: '#667eea' }} />}
											placeholder="Пароль"
											className="rounded-lg h-11 border-gray-200 transition-all duration-300 ease-in-out focus:border-indigo-500"
										/>
									</Form.Item>
								</motion.div>

								<motion.div animate={{ opacity: [0, 1], transition: { ease: ['easeIn', 'easeOut'] } }}>
									<Form.Item className="!mb-0">
										<motion.div
											whileHover={{ scale: 1.04 }}
											whileTap={{ scale: 0.98 }}
											transition={{ type: 'spring', stiffness: 120, damping: 10 }}
										>
											<Button
												type="primary"
												htmlType="submit"
												loading={isPending}
												block
												icon={!isPending && <LoginOutlined />}
												className="h-12 rounded-lg text-base font-medium border-none"
												style={{
													background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
													boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
												}}
											>
												{isPending ? 'Выполняется вход...' : 'Войти'}
											</Button>
										</motion.div>
									</Form.Item>
								</motion.div>
							</Form>
						</motion.div>
					</Space>
				</Card>
			</motion.div>
		</motion.div>
	)
}
