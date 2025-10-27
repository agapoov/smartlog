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
 * ✅ Стабильный WebSocket-хук:
 * - Одно соединение на чат
 * - Переподключение при смене chatId/token
 * - Без зацикленных реконнектов
 */
export const useChatWebSocket = ({ chatId, token, onMessage, onTyping, onReadMessage }: UseChatWebSocketParams) => {
	const queryClient = useQueryClient()
	const wsRef = useRef<WebSocket | null>(null)
	const reconnectTimer = useRef<number | null>(null)
	const [connected, setConnected] = useState(false)
	const [lastMessage, setLastMessage] = useState<IMessage | null>(null)
	const isManualClose = useRef(false) // ✅ защита от циклов reconnect

	// Очистка таймера реконнекта
	const clearReconnect = useCallback(() => {
		if (reconnectTimer.current !== null) {
			clearTimeout(reconnectTimer.current)
			reconnectTimer.current = null
		}
	}, [])

	const disconnect = useCallback(() => {
		if (!wsRef.current) return
		console.log('[WS] disconnecting...')
		isManualClose.current = true
		clearReconnect()

		wsRef.current.onclose = null
		wsRef.current.onerror = null
		wsRef.current.onmessage = null
		wsRef.current.close(1000, 'manual close')
		wsRef.current = null
		setConnected(false)
	}, [clearReconnect])

	const connect = useCallback(() => {
		if (!chatId || !token) {
			console.log('[WS] missing chatId or token → skip connect')
			return
		}

		// уже есть активное соединение → не создаем новое
		if (wsRef.current) {
			console.log('[WS] already connected, skip new connect')
			return
		}

		const wsBase = import.meta.env.VITE_WS_URL?.replace(/\/+$/, '') ?? 'ws://localhost:8000/ws'
		const wsUrl = `${wsBase}/chat/${chatId}/?token=${encodeURIComponent(token)}`
		console.log('[WS] connecting to', wsUrl)

		const ws = new WebSocket(wsUrl)
		wsRef.current = ws
		isManualClose.current = false

		ws.onopen = () => {
			console.log('[WS] connected ✅', chatId)
			setConnected(true)
			clearReconnect()
		}

		ws.onclose = (event) => {
			console.warn('[WS] closed', event.code, event.reason)
			wsRef.current = null
			setConnected(false)

			// если закрытие не было вручную → реконнект
			if (!isManualClose.current && ![1000, 1001].includes(event.code)) {
				reconnectTimer.current = window.setTimeout(connect, 2000)
			}
		}

		ws.onerror = (err) => {
			console.error('[WS] error → reconnect', err)
			setConnected(false)
			ws.close()
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				console.log('[WS] incoming:', data)

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

				// обычное сообщение
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
		[send, queryClient],
	)

	// 🔥 Переподключение при смене chatId/token
	useEffect(() => {
		connect()

		return () => {
			disconnect()
		}
	}, [chatId, token]) // без connect/disconnect в deps — чтобы не вызывать повторно при их пересоздании

	return { send, readMessage, connected, lastMessage }
}
