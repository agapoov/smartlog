import React from 'react'

type AppLayoutProps = {
	children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">{children}</div>
}
