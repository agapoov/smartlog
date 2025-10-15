/**
 * Получает referrer URL из query параметров или document.referrer
 */
export const getReferrerUrl = (): string | null => {
	// Сначала проверяем query параметр ref
	const urlParams = new URLSearchParams(window.location.search)
	const refParam = urlParams.get('ref')

	if (refParam) {
		return refParam
	}

	// Затем проверяем document.referrer
	if (document.referrer) {
		return document.referrer
	}

	return null
}

/**
 * Проверяет, принадлежит ли URL тому же домену
 */
export const isSameDomain = (url: string): boolean => {
	try {
		const referrerUrl = new URL(url)
		const currentUrl = new URL(window.location.href)
		return referrerUrl.hostname === currentUrl.hostname
	} catch {
		return false
	}
} 