import {
	TruckOutlined,
	OrderedListOutlined,
	DollarCircleOutlined,
	UsergroupAddOutlined,
	HomeOutlined,
} from '@ant-design/icons'

export interface MenuItem {
	to: string
	icon: React.ReactNode
	label: string
	description: string
}

export const useMenuItems = (): MenuItem[] => {
	return [
		{
			to: '/',
			icon: <HomeOutlined />,
			label: 'На главную',
			description: 'Вернуться на главную страницу',
		},
		{
			to: '/cargo',
			icon: <TruckOutlined />,
			label: 'Грузы',
			description: 'Перейти в отображение и создание Грузов',
		},
		{
			to: '/orders',
			icon: <OrderedListOutlined />,
			label: 'Заказы',
			description: 'Перейти в отображение и создание заказов',
		},
		{
			to: '/responses',
			icon: <DollarCircleOutlined />,
			label: 'Отклики',
			description: 'Перейти в отображение откликов',
		},
		{
			to: '/chat',
			icon: <UsergroupAddOutlined />,
			label: 'Мессенджер',
			description: 'Перейти во внутренний мессенджер',
		},
	]
}
