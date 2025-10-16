import { $authHost } from '@/features/auth'
import type { Cargo, CreateCargoRequest } from '../model/types'

export const cargoApi = {
	async getList() {
		return $authHost.get<{ data: Cargo[] | Cargo }>('api/cargo/')
	},

	async create(payload: CreateCargoRequest) {
		return $authHost.post<Cargo>('api/cargo/', payload)
	},
}
