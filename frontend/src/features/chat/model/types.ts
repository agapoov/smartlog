export interface IUser {
	id: number
	username: string
	first_name: string
	last_name: string
}

export interface IMessage {
	id: string
	content: string
	message_type: 'text' | 'file' | 'system'
	created_at: string
	updated_at: string
	is_edited: boolean
	sender: IUser
	files: Array<{
		id: string
		url: string
		name: string
		size?: number
	}>
	reply_to: IMessage | null
}

export interface IChat {
	id: string
	name: string
	description: string
	logo: string | null
	created_by: IUser
	created_at: string
	updated_at: string
	is_active: boolean
	order: number | null
	participants_count: number
	last_message: IMessage | null
	unread_count: number
}

export interface INotification {
	id: number
	chat: {
		id: string
		name: string
		description: string
	}
	message: {
		id: string
		content: string
		sender: {
			id: number
			username: string
			first_name: string
			last_name: string
		}
		created_at: string
	}
	is_read: boolean
	created_at: string
}

export interface IGetChatListParams {
	search?: string
	order_id?: number
	page?: number
	page_size?: number
}

export interface IGetChatMessagesParams {
	page?: number
	page_count?: number
}

export interface IDtoCreateChat {
	name: string
	description: string
	logo?: File | null
	order: number
	participant_ids?: number[]
}

export interface IDtoSendMessage {
	content: string
	message_type: 'text' | 'file'
	reply_to_id?: number
	files?: File[]
}

export interface IDtoAddMember {
	user_id: number
	is_admin: boolean
}

export interface IDtoPutChat {
	name: string
	descrtiption: string
	logo?: File | null
}

export interface IGetChatListResponse {
	count: number
	next: string | null
	previous: string | null
	results: IChat[]
}

export interface IGetChatMessagesResponse {
	pagination: {
		page_count: number
		page: number
		total_count: number
		has_next: boolean
		has_previous: boolean
	}
	data: IMessage[]
}
