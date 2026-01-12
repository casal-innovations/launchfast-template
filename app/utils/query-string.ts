// Function to build an array of URL-encoded key-value pairs
const buildUrlEncodedPairs = (
	obj: Record<string, any>,
	parentKey: string = '',
): string[] => {
	const pairs: string[] = []

	for (const [key, value] of Object.entries(obj)) {
		const fullKey = parentKey ? `${parentKey}[${key}]` : key

		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			// Recursively handle nested objects
			pairs.push(...buildUrlEncodedPairs(value, fullKey))
		} else if (Array.isArray(value)) {
			// Handle arrays by iterating through each element
			value.forEach((v, index) => {
				const arrayKey = `${fullKey}[${index}]`
				if (typeof v === 'object' && v !== null) {
					pairs.push(...buildUrlEncodedPairs(v, arrayKey))
				} else {
					pairs.push(
						`${encodeURIComponent(arrayKey)}=${encodeURIComponent(String(v))}`,
					)
				}
			})
		} else {
			// Encode scalar values (including numbers, booleans, etc.)
			pairs.push(
				`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`,
			)
		}
	}

	return pairs
}

// Function to join the array of key-value pairs into a query string
const joinUrlEncodedPairs = (pairs: string[]): string => pairs.join('&')

// Combined function that builds and joins the key-value pairs
export const objectToQueryString = (obj: Record<string, any>): string => {
	const pairs = buildUrlEncodedPairs(obj)
	return joinUrlEncodedPairs(pairs)
}
