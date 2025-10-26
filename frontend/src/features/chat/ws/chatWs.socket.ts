// src/features/chat/ws/chatWs.socket.ts

import type { IMessage } from '@/features/chat/model/types'

/* ------------------------------------------------------------------ */
/*  Типы сообщений                                                    */
/* ------------------------------------------------------------------ */
export type WSIncoming =
	| {
			type: 'chat_message'
			message: IMessage
	  }
	| {
			type: 'typing'
			user: string // username
			is_typing: boolean
	  }

export type WSOutgoing =
	| {
			type: 'chat_message'
			content: string
			reply_to_id?: string
	  }
	| {
			type: 'typing'
			is_typing: boolean
	  }
	| {
			type: 'read_message'
			message_id: string
	  }

/* ------------------------------------------------------------------ */
/*  Хук WebSocket                                                     */
/* ------------------------------------------------------------------ */
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_GET_CHAT_MESSAGES } from '../consts/queryKeys'

type UseChatWebSocketParams = {
	chatId: string | number
	token: string | null
	onMessage?: (msg: IMessage) => void
	onTyping?: (user: string, isTyping: boolean) => void
}

export const useChatWebSocket = ({ chatId, token, onMessage, onTyping }: UseChatWebSocketParams) => {
	const wsRef = useRef<WebSocket | null>(null)
	const queryClient = useQueryClient()
	const reconnectTimeoutRef = useRef<number | null>(null)

	// Очистка таймаута при размонтировании
	const clearReconnect = () => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}
	}

	const connect = useCallback(() => {
		if (!token || !chatId) return

		// Полный URL с chat_id и token
		const wsBase = import.meta.env.VITE_WS_URL?.replace(/\/+$/, '') ?? 'ws://localhost:8000/ws'
		const wsUrl = `${wsBase}/chat/${chatId}/?token=${encodeURIComponent(token)}`

		const ws = new WebSocket(wsUrl)
		wsRef.current = ws

		ws.onopen = () => {
			console.log('[WS] connected →', chatId)
			clearReconnect()
		}

		ws.onclose = (event) => {
			console.log('[WS] closed', event.code, event.reason)
			wsRef.current = null

			// Переподключаемся только при аномальном закрытии
			if (event.code !== 1000 && event.code !== 1001) {
				reconnectTimeoutRef.current = setTimeout(connect, 2000)
			}
		}

		ws.onerror = (error) => {
			console.error('[WS] error → will reconnect', error)
			// При ошибке тоже пытаемся переподключиться
			if (!reconnectTimeoutRef.current) {
				reconnectTimeoutRef.current = setTimeout(connect, 2000)
			}
		}

		ws.onmessage = (event) => {
			let data: WSIncoming
			try {
				data = JSON.parse(event.data)
			} catch {
				console.warn('[WS] invalid JSON:', event.data)
				return
			}

			switch (data.type) {
				case 'chat_message':
					queryClient.setQueryData([QUERY_GET_CHAT_MESSAGES, chatId], (old: any): any => {
						if (!old?.results) return old

						const exists = old.results.some((m: IMessage) => m.id === data.message.id)
						if (exists) return old
						return {
							...old,
							results: [...old.results, data.message],
						}
					})

					onMessage?.(data.message)
					break

				case 'typing':
					onTyping?.(data.user, data.is_typing)
					break
			}
		}
	}, [chatId, token, queryClient, onMessage, onTyping])

	// Отправка — только если соединение открыто
	const send = useCallback((payload: WSOutgoing) => {
		const ws = wsRef.current
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(payload))
		} else {
			console.warn('[WS] cannot send: not connected (state:', ws?.readyState, ')')
		}
	}, [])

	// Подключение / отключение
	useEffect(() => {
		if (!chatId || !token) {
			if (wsRef.current) {
				wsRef.current.close()
				wsRef.current = null
			}
			clearReconnect()
			return
		}

		connect()

		return () => {
			clearReconnect()
			if (wsRef.current) {
				wsRef.current.close()
				wsRef.current = null
			}
		}
	}, [chatId, token]) // Зависимости только от chatId и token

	return { send }
}
