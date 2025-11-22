// shared/ui/MainLayout.tsx
import type { FC, ReactNode } from 'react'
import { MenuCircles } from './MenuCircles'
import {
	TruckOutlined,
	OrderedListOutlined,
	DollarCircleOutlined,
	UsergroupAddOutlined,
	HomeOutlined,
} from '@ant-design/icons'
import { observer } from 'mobx-react-lite' // <-- обязательно для реакции на MobX
import { authStore } from '@/features/auth'

interface MainLayoutProps {
	children: ReactNode
	title?: string
	showGoBack?: boolean
}

const menuItems = [
	{ to: '/', icon: <HomeOutlined />, label: 'На главную' },
	{ to: '/cargo', icon: <TruckOutlined />, label: 'Грузы' },
	{ to: '/orders', icon: <OrderedListOutlined />, label: 'Заказы' },
	{ to: '/responses', icon: <DollarCircleOutlined />, label: 'Отклики' },
	{ to: '/chat', icon: <UsergroupAddOutlined />, label: 'Чаты' },
]

export const MainLayout: FC<MainLayoutProps> = observer(({ children, title }) => {
	const isAuthenticated = authStore.isAuthenticated

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="max-w-7xl mx-auto">
				<div className="flex gap-2">
					{/* Показываем меню ТОЛЬКО если авторизован */}
					{isAuthenticated && (
						<div className="sticky top-6 self-start flex-shrink-0">
							<MenuCircles items={menuItems} />
						</div>
					)}

					{/* Основной контент — всегда показываем */}
					<div className={isAuthenticated ? 'flex-1 min-w-0' : 'w-full'}>
						<div className="bg-white rounded-2xl shadow-lg p-6">
							{title && <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>}
							<div className="overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-none">{children}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
})
