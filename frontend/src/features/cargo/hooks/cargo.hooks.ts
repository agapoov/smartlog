import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cargoApi } from '../api/cargo-api'
import type { CreateCargoRequest, Cargo } from '../model/types'

export const useCargoList = () =>
	useQuery({
		queryKey: ['cargo', 'list'],
		queryFn: async () => await cargoApi.getList().then((res) => res.data),
	})

export const useCreateCargo = () => {
	const queryClient = useQueryClient()
	return useMutation<Cargo, Error, CreateCargoRequest>({
		mutationFn: (payload) => cargoApi.create(payload).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cargo', 'list'] })
		},
	})
}
