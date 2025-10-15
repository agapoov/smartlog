class TokenService {
	private readonly ACCESS_TOKEN_KEY = 'access_token'
	private readonly REFRESH_TOKEN_KEY = 'refresh_token'

	get access(): string {
		return localStorage.getItem(this.ACCESS_TOKEN_KEY) || ''
	}

	get refresh(): string {
		return localStorage.getItem(this.REFRESH_TOKEN_KEY) || ''
	}

	setAccess(token: string): void {
		if (token) {
			localStorage.setItem(this.ACCESS_TOKEN_KEY, token)
		} else {
			localStorage.removeItem(this.ACCESS_TOKEN_KEY)
		}
	}

	setRefresh(token: string): void {
		if (token) {
			localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
		} else {
			localStorage.removeItem(this.REFRESH_TOKEN_KEY)
		}
	}

	clear(): void {
		localStorage.removeItem(this.ACCESS_TOKEN_KEY)
		localStorage.removeItem(this.REFRESH_TOKEN_KEY)
	}

	hasValidTokens(): boolean {
		return Boolean(this.access && this.refresh)
	}
}

export const tokenService = new TokenService()
