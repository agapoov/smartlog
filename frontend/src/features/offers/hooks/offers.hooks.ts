import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FindOffersRequest, RespondOfferRequest } from '../model/types'
import { offersApi } from '../api/offers-api'

export const useFindOffers = (payload: FindOffersRequest) =>
	useQuery({
		queryKey: ['offers', payload.order_id],
		queryFn: async () => await offersApi.findOffers(payload).then((res) => res.data),
	})

export const useRespondOffer = () => {
	const queryClient = useQueryClient()
	return useMutation<{ message: string }, Error, RespondOfferRequest>({
		mutationFn: (payload) => offersApi.respondOffer(payload).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['responses'] })
		},
	})
}

export const useResponsesList = (params: { order_id?: number; status?: string }) =>
	useQuery({
		queryKey: ['responses', params],
		queryFn: async () => await offersApi.getResponses(params).then((res) => res.data),
	})
