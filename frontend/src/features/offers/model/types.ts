export interface Offer {
	id: number
	carrier_name: string
	carrier_inn: string
	carrier_rating: number
	price: number
	delivery_time: number
	reliability_score: number
	coefficient: number
	coefficient_breakdown: {
		price_score: number
		rating_score: number
		time_score: number
		reliability_score: number
		explanation: {
			price: string
			rating: string
			time: string
			reliability: string
		}
	}
}

export interface OrderInfo {
	id: number
	route: string
	distance: number
	cargo_weight: number
	cargo_volume: number
}

export interface Response {
	id: number
	order_id: number
	offer_id: number
	status: 'pending' | 'accepted' | 'rejected' | 'completed'
	created_at: string
}

export interface FindOffersRequest {
	order_id: number
}

export interface RespondOfferRequest {
	order_id: number
	offer_id: number
}
