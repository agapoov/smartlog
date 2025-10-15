import { useMutation, useQuery } from '@tanstack/react-query'
import { cargoApi } from '../api/cargo-api'
import type { CreateCargoRequest, Cargo } from '../model/types'

export const useCargoList = () =>
	useQuery<Cargo[]>({
		queryKey: ['cargo', 'list'],
		queryFn: () => cargoApi.getList(),
	})

export const useCreateCargo = () =>
	useMutation<Cargo, Error, CreateCargoRequest>({
		mutationFn: (payload) => cargoApi.create(payload),
	})
