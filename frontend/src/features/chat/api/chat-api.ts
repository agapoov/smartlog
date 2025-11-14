import { $authHost } from '@/features/auth'
import type {
	IChat,
	IDtoAddMember,
	IDtoCreateChat,
	IDtoPutChat,
	IDtoSendMessage,
	IGetChatListParams,
	IGetChatListResponse,
	IGetChatMessagesParams,
	IGetChatMessagesResponse,
	IMessage,
	INotification,
	IUser,
} from '../model/types'

export const chatApi = {
	async getUsersList() {
		return $authHost.get<IUser[]>('api/users/')
	},

	async getList(params: IGetChatListParams) {
		return $authHost.get<IGetChatListResponse>('api/chat/chats/', {
			params: params,
		})
	},

	async getItem(id: string) {
		return $authHost.get<IChat>(`api/chat/chats/${id}/`)
	},

	async getChatMessages(chat_id: string, params: IGetChatMessagesParams) {
		return $authHost.get<IGetChatMessagesResponse>(`api/chat/chats/${chat_id}/messages/`, { params: params })
	},

	async getNotification() {
		return $authHost.get<INotification>('api/chat/notifications/')
	},

	async readNotification(id: number) {
		return $authHost.post<IChat>(`api/chat/notifications/${id}/read/`)
	},

	async readAllNotification() {
		return $authHost.post<IChat>(`api/chat/notifications/read-all/`)
	},

	async create(data: IDtoCreateChat) {
		return $authHost.post<IChat>('api/chat/chats/create/', data)
	},

	async sendMessage(chat_id: string, data: IDtoSendMessage) {
		return $authHost.post<IMessage>(`api/chat/chats/${chat_id}/send/`, data)
	},

	async addMember(chatId: string, data: IDtoAddMember) {
		return $authHost.post(`api/chat/chats/${chatId}/send/`, data)
	},

	async updateChat(chat_id: number, data: IDtoPutChat) {
		return $authHost.put(`api/chat/chats/${chat_id}/update/`, data)
	},

	async removeMember(chat_id: string, user_id: number) {
		await $authHost.delete(`api/chat/chats/${chat_id}/remove-participant/${user_id}/`)
	},

	async deleteChat(chat_id: number) {
		return $authHost.delete(`api/chat/chats/${chat_id}/delete/`)
	},
}
