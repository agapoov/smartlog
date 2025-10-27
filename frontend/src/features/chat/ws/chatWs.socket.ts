import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_GET_ALL_CHATS, QUERY_GET_CHAT_BY_ID, QUERY_GET_CHAT_MESSAGES } from '../consts/queryKeys'
import type { IMessage } from '../model/types'

export type WSOutgoing =
	| { type: 'chat_message'; content: string; reply_to_id?: string }
	| { type: 'typing'; is_typing: boolean }
	| { type: 'read_message'; message_id: string }

type UseChatWebSocketParams = {
	chatId: string | number
	token: string | null
	onMessage?: (msg: IMessage) => void
	onTyping?: (user: string, isTyping: boolean) => void
	onReadMessage?: (messageId: string) => void
}

/**
 * Устойчивый к StrictMode WebSocket-хук:
 * - Одно подключение на (chatId + token)
 * - Авто-реконнект
 * - Реакция на входящие сообщения без поля "type"
 * - Поддержка read_message и typing
 */
export const useChatWebSocket = ({ chatId, token, onMessage, onTyping, onReadMessage }: UseChatWebSocketParams) => {
	const queryClient = useQueryClient()
	const wsRef = useRef<WebSocket | null>(null)
	const reconnectTimer = useRef<number | null>(null)
	const mountedRef = useRef(false)
	const [connected, setConnected] = useState(false)
	const [lastMessage, setLastMessage] = useState<IMessage | null>(null)

	const clearReconnect = useCallback(() => {
		if (reconnectTimer.current !== null) {
			clearTimeout(reconnectTimer.current)
			reconnectTimer.current = null
		}
	}, [])

	const connect = useCallback(() => {
		if (!chatId || !token) return
		if (wsRef.current) {
			console.log('[WS] already connected → skip')
			return
		}

		const wsBase = import.meta.env.VITE_WS_URL?.replace(/\/+$/, '') ?? 'ws://localhost:8000/ws'
		const wsUrl = `${wsBase}/chat/${chatId}/?token=${encodeURIComponent(token)}`
		console.log('[WS] connecting to', wsUrl)

		const ws = new WebSocket(wsUrl)
		wsRef.current = ws

		ws.onopen = () => {
			console.log('[WS] connected ✅', chatId)
			setConnected(true)
			clearReconnect()
		}

		ws.onclose = (event) => {
			console.warn('[WS] closed', event.code, event.reason)
			wsRef.current = null
			setConnected(false)

			if (event.code !== 1000 && event.code !== 1001) {
				reconnectTimer.current = window.setTimeout(connect, 2000)
			}
		}

		ws.onerror = (err) => {
			console.error('[WS] error → reconnect', err)
			setConnected(false)
			ws.close()
			if (!reconnectTimer.current) {
				reconnectTimer.current = window.setTimeout(connect, 2000)
			}
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				console.log('[WS] incoming:', data)

				// ---- обработка системных типов ----
				if (data.type === 'read_message') {
					const messageId = data.message_id
					console.log('[WS] message read:', messageId)

					queryClient.setQueryData([QUERY_GET_CHAT_MESSAGES, chatId], (oldData: any) => {
						if (!oldData?.results) return oldData
						return {
							...oldData,
							results: oldData.results.map((msg: IMessage) => (msg.id === messageId ? { ...msg, is_read: true } : msg)),
						}
					})

					onReadMessage?.(messageId)
					return
				}

				if (data.type === 'typing') {
					onTyping?.(data.user, data.is_typing)
					return
				}

				// ---- обработка обычного сообщения ----
				setLastMessage(data)
				queryClient.invalidateQueries({ queryKey: [QUERY_GET_CHAT_MESSAGES, chatId] })
				queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
				queryClient.invalidateQueries({ queryKey: [QUERY_GET_CHAT_BY_ID, chatId] })
				onMessage?.(data)
			} catch (e) {
				console.warn('[WS] invalid JSON:', event.data)
			}
		}
	}, [chatId, token, onMessage, onTyping, onReadMessage, queryClient, clearReconnect])

	const send = useCallback((payload: WSOutgoing) => {
		const ws = wsRef.current
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(payload))
		} else {
			console.warn('[WS] cannot send, not connected')
		}
	}, [])

	const readMessage = useCallback(
		(messageId: string) => {
			if (!messageId) return
			send({ type: 'read_message', message_id: messageId })
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
		[send],
	)

	useEffect(() => {
		if (mountedRef.current) return
		mountedRef.current = true

		if (!chatId || !token) return

		connect()

		return () => {
			console.log('[WS] cleanup')
			mountedRef.current = false
			clearReconnect()
			wsRef.current?.close()
			wsRef.current = null
			setConnected(false)
		}
	}, [chatId, token])

	return { send, readMessage, connected, lastMessage }
}
