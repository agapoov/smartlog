import { Tooltip } from 'antd'
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
						<button
							onClick={() => navigate({ to: item.to })}
							className={classNames(
								'relative w-14 !h-14 flex rounded-full items-center justify-center text-3xl transition-all duration-200',
								'hover:scale-105',
								'border-t-[1.5px] border-t-indigo-100/70 border-b-[1px] border-b-gray-50/30',
								{
									'bg-indigo-500 text-white shadow-lg scale-110': isActive,
									'bg-white/90 text-gray-600 hover:bg-gray-50': !isActive,
								},
							)}
						>
							{item.icon}

							{isActive && (
								<span className="absolute -bottom-1 border-[0.5px] border-gray-100/50 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full" />
							)}
						</button>
					</Tooltip>
				)
			})}
		</div>
	)
}
