import { $authHost } from '@/features/auth'
import type { FindOffersRequest, Offer, OrderInfo, RespondOfferRequest, ResponsesApiResponse } from '../model/types'

export const offersApi = {
	async findOffers(payload: FindOffersRequest) {
		return $authHost.post<{ offers: Offer[]; total_coefficient: number; order_info: OrderInfo; message: string }>(
			'api/integrations/transport/find_offers/',
			payload,
		)
	},

	async respondOffer(payload: RespondOfferRequest) {
		return $authHost.post<{ message: string }>('api/integrations/transport/respond/', payload)
	},

	async getResponses(params: { order_id?: number; status?: string }) {
		return $authHost.get<ResponsesApiResponse>('api/integrations/transport/responses/', { params })
	},
}
