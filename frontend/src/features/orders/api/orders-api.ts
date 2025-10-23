import { $authHost } from '@/features/auth'
import type { CreateOrdersRequest, Order } from '../model/types'

export const ordersApi = {
	async getList() {
		return $authHost.get<{ data: Order[] | Order }>('api/orders/')
	},

	async getItem(id: number) {
		return $authHost.get<{ data: Order }>(`api/orders/${id}`)
	},

	async create(payload: CreateOrdersRequest) {
		return $authHost.post<Order>('api/orders/', payload)
	},
}
