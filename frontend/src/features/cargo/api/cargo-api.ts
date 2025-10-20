import { $authHost } from '@/features/auth'
import type { Cargo, CreateCargoRequest, ICargoResponseWithPagination } from '../model/types'

export const cargoApi = {
	async getList() {
		return $authHost.get<ICargoResponseWithPagination>('api/cargo/')
	},

	async create(payload: CreateCargoRequest) {
		return $authHost.post<Cargo>('api/cargo/', payload)
	},
}
