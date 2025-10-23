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

	isAccessTokenExpired(): boolean {
		const token = this.access
		if (!token) return true

		try {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const currentTime = Math.floor(Date.now() / 1000)

			return payload.exp < currentTime + 300
		} catch {
			return true
		}
	}

	isRefreshTokenExpired(): boolean {
		const token = this.refresh
		if (!token) return true

		try {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const currentTime = Math.floor(Date.now() / 1000)

			return payload.exp < currentTime
		} catch {
			return true
		}
	}

	hasValidTokens(): boolean {
		return Boolean(this.access && this.refresh && !this.isRefreshTokenExpired())
	}

	needsRefresh(): boolean {
		return Boolean(this.access && this.refresh && this.isAccessTokenExpired() && !this.isRefreshTokenExpired())
	}
}

export const tokenService = new TokenService()
