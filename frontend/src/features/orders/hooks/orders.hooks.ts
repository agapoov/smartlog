import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateOrdersRequest, Order } from '../model/types'
import { ordersApi } from '../api/orders-api'

export const useOrdersList = () =>
	useQuery({
		queryKey: ['orders-list'],
		queryFn: async () => await ordersApi.getList().then((res) => res.data),
	})

export const useOrdersById = (id: number) =>
	useQuery({
		queryKey: ['orders-list-item'],
		queryFn: async () => await ordersApi.getItem(id).then((res) => res.data),
	})

export const useCreateOrders = () => {
	const queryClient = useQueryClient()
	return useMutation<Order, Error, CreateOrdersRequest>({
		mutationFn: (payload) => ordersApi.create(payload).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders-list'] })
		},
	})
}
