import { $authHost } from '@/features/auth'
import type { Cargo, CreateCargoRequest } from '../model/types'

export const cargoApi = {
	async getList() {
		const { data } = await $authHost.get<Cargo[]>('api/cargo/')
		return data
	},

	async create(payload: CreateCargoRequest) {
		const { data } = await $authHost.post<Cargo>('api/cargo/', payload)
		return data
	},
}
