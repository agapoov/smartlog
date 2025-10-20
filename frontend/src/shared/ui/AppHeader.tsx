import { Button, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import React from 'react'
import { useNavigate } from '@tanstack/react-router'

type AppLayoutProps = {
	title: string
	showGoBack: boolean
}

const { Title } = Typography

export const AppHeader: React.FC<AppLayoutProps> = ({ title, showGoBack }) => {
	const navigate = useNavigate()

	const handleGoBack = () => {
		navigate({ to: '/' }) // Навигация назад по истории
	}

	return (
		<Space align="center" size="middle">
			{showGoBack && (
				<Button type="text" icon={<ArrowLeftOutlined />} onClick={handleGoBack} style={{ fontSize: '16px' }}>
					Назад
				</Button>
			)}
			<Title level={2} className="!m-0">
				{title}
			</Title>
		</Space>
	)
}
