import { tokenService } from '@/shared/lib/token-service'
import { makeAutoObservable } from 'mobx'
import { router } from '@/main'

class AuthStore {
	private _isAuthenticated: boolean = false

	get isAuthenticated() {
		return this._isAuthenticated
	}

	set isAuthenticated(value: boolean) {
		this._isAuthenticated = value
	}

	constructor() {
		const hasValid = tokenService.hasValidTokens()
		this._isAuthenticated = hasValid

		if (!hasValid) {
			this.logout()
		}

		makeAutoObservable(this)
	}

	// Выносим логику выхода в отдельный метод
	logout = async () => {
		this._isAuthenticated = false
		tokenService.clear()
		await router.navigate({ to: '/login' })
		router.invalidate()
	}
}

export const authStore = new AuthStore()
