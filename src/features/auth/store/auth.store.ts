import { tokenService } from '@/shared/lib/token-service'
import { makeAutoObservable } from 'mobx'

class AuthStore {
	private _isAuthenticated: boolean = false

	get isAuthenticated() {
		return this._isAuthenticated
	}

	set isAuthenticated(isAuthenticated: boolean) {
		this._isAuthenticated = isAuthenticated
	}

	constructor() {
		this._isAuthenticated = tokenService.hasValidTokens()
		makeAutoObservable(this)
	}
}

export const authStore = new AuthStore()
