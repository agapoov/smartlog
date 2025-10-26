import { useEffect, useRef } from 'react'
import { useChatWebSocket } from '../ws/chatWs.socket'

export const useChatTyping = (chatId: string, token: string | null) => {
	const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const { send } = useChatWebSocket({
		chatId,
		token,
	})

	const startTyping = () => {
		if (typingTimeout.current) clearTimeout(typingTimeout.current)
		send({ type: 'typing', is_typing: true })
		typingTimeout.current = setTimeout(() => {
			send({ type: 'typing', is_typing: false })
		}, 1500)
	}

	const stopTyping = () => {
		if (typingTimeout.current) clearTimeout(typingTimeout.current)
		send({ type: 'typing', is_typing: false })
	}

	useEffect(() => {
		return stopTyping
	}, [])

	return { startTyping, stopTyping }
}
