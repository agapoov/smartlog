import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { InfoCircleFilled } from '@ant-design/icons'
import { Typography } from 'antd'

const { Text } = Typography

interface HideableTooltipProps {
	text: string
	onDismiss?: () => void
}

export const HideableTooltip = ({ text, onDismiss }: HideableTooltipProps) => {
	const [isVisible, setIsVisible] = useState(true)

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.3, ease: 'easeOut' }}
					className="fixed top-5 right-5 text-white bg-black/75 py-2 px-4 rounded-md shadow-lg z-[1000] text-sm max-w-xs flex items-center"
					onClick={() => {
						setIsVisible(false)
						if (onDismiss) onDismiss()
					}}
					role="tooltip"
					aria-label={text}
				>
					<InfoCircleFilled className="text-white text-lg mr-2" />
					<Text style={{ color: 'white' }}>{text}</Text>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
