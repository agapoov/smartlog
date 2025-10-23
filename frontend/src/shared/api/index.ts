// Экспорт базовых API клиентов
export { $host, $auth } from './base'

// Экспорт auth-специфичных компонентов
export { authApi, $authHost, authErrorHandler, authUtils, type LoginRequest, type TokenResponse } from '@/features/auth'

// Экспорт token service
export { tokenService } from '@/shared/lib/token-service'

// Экспорт cargo фичи
export {
	cargoApi,
	useCargoList,
	useCreateCargo,
	CargoType,
	type Cargo,
	type CreateCargoRequest,
} from '@/features/cargo'
