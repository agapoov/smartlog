export enum CargoType {
	GENERAL = 'general',
	BULK = 'bulk',
	LIQUID = 'liquid',
	CONTAINER = 'container',
	REFRIGERATED = 'refrigerated',
	DANGEROUS = 'dangerous',
	OVERSIZED = 'oversized',
	ANIMALS = 'animals',
	PERISHABLE = 'perishable',
	OTHER = 'other',
}

export interface ICargoResponseWithPagination {
	total: number
	page_count: number
	data: Cargo[]
}

export type Cargo = {
	readonly id: number
	name: string
	cargo_type: CargoType
	cargo_weight: number
	cargo_volume: number
}

export type CreateCargoRequest = {
	name: string
	cargo_type: CargoType
	cargo_weight: number
	cargo_volume: number
}
