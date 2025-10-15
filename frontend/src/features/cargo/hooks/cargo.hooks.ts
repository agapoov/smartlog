import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cargoApi } from '../api/cargo-api'
import type { CreateCargoRequest, Cargo } from '../model/types'

export const useCargoList = () =>
	useQuery<Cargo[]>({
		queryKey: ['cargo', 'list'],
		queryFn: () => cargoApi.getList(),
	})

export const useCreateCargo = () => {
	const queryClient = useQueryClient()
	return useMutation<Cargo, Error, CreateCargoRequest>({
		mutationFn: (payload) => cargoApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cargo', 'list'] })
		},
	})
}
