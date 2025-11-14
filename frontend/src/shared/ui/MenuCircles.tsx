// shared/ui/MenuCircles.tsx
import { Button, Tooltip } from 'antd'
import { useLocation, useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import type { FC } from 'react'

interface MenuItem {
	to: string
	icon: React.ReactNode
	label: string
}

interface MenuCirclesProps {
	items: MenuItem[]
}

export const MenuCircles: FC<MenuCirclesProps> = ({ items }) => {
	const location = useLocation()
	const navigate = useNavigate()

	return (
		<div className="flex flex-col gap-4">
			{items.map((item) => {
				const isActive = location.pathname === item.to

				return (
					<Tooltip key={item.to} title={item.label} placement="right">
						<Button
							shape="circle"
							onClick={() => navigate({ to: item.to })}
							className={classNames(
								'relative w-14 !h-14 flex items-center justify-center text-3xl transition-all duration-200',
								'hover:scale-105',
								{
									'bg-indigo-600 text-white shadow-lg scale-110': isActive,
									'bg-white text-gray-600 hover:bg-gray-50': !isActive,
								},
							)}
						>
							{item.icon}

							{isActive && (
								<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full" />
							)}
						</Button>
					</Tooltip>
				)
			})}
		</div>
	)
}
