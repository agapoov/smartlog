import { CargoType } from '@/shared/api'

export const cargoTypeConfig = {
	[CargoType.GENERAL]: {
		label: 'Общий',
		tagColor: 'blue',
	},
	[CargoType.BULK]: {
		label: 'Насыпной',
		tagColor: 'green',
	},
	[CargoType.LIQUID]: {
		label: 'Жидкий',
		tagColor: 'yellow',
	},
	[CargoType.CONTAINER]: {
		label: 'Контейнерный',
		tagColor: 'purple',
	},
	[CargoType.REFRIGERATED]: {
		label: 'Холодильный',
		tagColor: 'cyan',
	},
	[CargoType.DANGEROUS]: {
		label: 'Опасный',
		tagColor: 'red',
	},
	[CargoType.OVERSIZED]: {
		label: 'Негабаритный',
		tagColor: 'pink',
	},
	[CargoType.ANIMALS]: {
		label: 'Животные',
		tagColor: '#fadb14',
	},
	[CargoType.PERISHABLE]: {
		label: 'Скоропортящийся',
		tagColor: '#a0d911',
	},
	[CargoType.OTHER]: {
		label: 'Другое',
		tagColor: 'default',
	},
}

export const getCargoTypeDisplay = (type: CargoType) => {
	return cargoTypeConfig[type] || { label: type, tagColor: '#d3d3d3' }
}
