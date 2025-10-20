export interface Order {
	id: number
	distance: number
	duration: number
	created_at: string
	start_address: string
	end_address: string
	loading_date: string
	price: number
	cargo: number
}

export interface CreateOrdersRequest {
	start_address: string
	end_address: string
	loading_date: string
	cargo: number
	price: number
}
