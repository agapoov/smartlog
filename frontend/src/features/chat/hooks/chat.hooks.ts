import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
	IChat,
	IDtoAddMember,
	IDtoCreateChat,
	IDtoPutChat,
	IDtoSendMessage,
	IGetChatListParams,
	IGetChatMessagesParams,
	IMessage,
} from '../model/types'
import { chatApi } from '../api/chat-api'
import {
	QUERY_GET_ALL_CHATS,
	QUERY_GET_ALL_USERS,
	QUERY_GET_CHAT_BY_ID,
	QUERY_GET_CHAT_MESSAGES,
	QUERY_GET_NOTIFICATIONS,
} from '../consts/queryKeys'

export const useGetAllUsers = () =>
	useQuery({
		queryKey: [QUERY_GET_ALL_USERS],
		queryFn: async () => {
			const res = await chatApi.getUsersList()
			return res.data
		},
	})

export const useGetAllChats = (params?: IGetChatListParams) =>
	useQuery({
		queryKey: [QUERY_GET_ALL_CHATS, params],
		queryFn: async () => {
			const res = await chatApi.getList(params || {})
			return res.data
		},
	})

export const useGetChatById = (id: string | number) =>
	useQuery({
		queryKey: [QUERY_GET_CHAT_BY_ID, id],
		queryFn: async () => {
			const res = await chatApi.getItem(Number(id))
			return res.data
		},
	})

export const useGetChatMessages = (chatId: string, params?: IGetChatMessagesParams) =>
	useQuery({
		queryKey: [QUERY_GET_CHAT_MESSAGES, chatId, params],
		queryFn: async () => {
			const res = await chatApi.getChatMessages(chatId, params || {})
			return res.data
		},
	})

export const useGetNotifications = () =>
	useQuery({
		queryKey: [QUERY_GET_NOTIFICATIONS],
		queryFn: async () => {
			const res = await chatApi.getNotification()
			return res.data
		},
	})

export const useCreateChat = () => {
	const queryClient = useQueryClient()
	return useMutation<IChat, Error, IDtoCreateChat>({
		mutationFn: (data) => chatApi.create(data).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})
}

export const useSendMessage = (chatId: string) => {
	const queryClient = useQueryClient()
	return useMutation<IMessage, Error, IDtoSendMessage>({
		mutationFn: (data) => chatApi.sendMessage(chatId, data).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_CHAT_MESSAGES, chatId] })
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})
}

export const useAddMember = (chatId: string | number) => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, IDtoAddMember>({
		mutationFn: (data) => chatApi.addMember(Number(chatId), data).then(() => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_CHAT_BY_ID, chatId] })
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})
}

export const useUpdateChat = (chatId: string | number) => {
	const queryClient = useQueryClient()
	return useMutation<IChat, Error, IDtoPutChat>({
		mutationFn: (data) => chatApi.updateChat(Number(chatId), data).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_CHAT_BY_ID, chatId] })
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})
}

export const useRemoveMember = (chatId: string | number, userId: number) => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, void>({
		mutationFn: () => chatApi.removeMember(Number(chatId), userId).then(() => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_CHAT_BY_ID, chatId] })
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
		},
	})
}

export const useDeleteChat = (chatId: string | number) => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, void>({
		mutationFn: () => chatApi.deleteChat(Number(chatId)).then(() => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_ALL_CHATS] })
			queryClient.removeQueries({ queryKey: [QUERY_GET_CHAT_BY_ID, chatId] })
			queryClient.removeQueries({ queryKey: [QUERY_GET_CHAT_MESSAGES, chatId] })
		},
	})
}

export const useReadNotification = (notificationId: number) => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, void>({
		mutationFn: () => chatApi.readNotification(notificationId).then(() => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_NOTIFICATIONS] })
		},
	})
}

export const useReadAllNotifications = () => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, void>({
		mutationFn: () => chatApi.readAllNotification().then(() => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_GET_NOTIFICATIONS] })
		},
	})
}
