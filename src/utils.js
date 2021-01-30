/**
 * @description Multiplies every number in a number[]
 * @param {number[]} numbers
 *
 * @returns {number}
 */
export const multiply = (numbers) => {
	const isAllNumbers = numbers.every((number) => typeof number === "number")
	if (!isAllNumbers) throw new Error("Only numbers can be multiplied")
	return numbers.reduce((prev, current) => prev * current)
}

/**
 * @param {T} func The function to be memoized
 * @param {Function} keyResolver This function will be used to create the key of each cache. if not defined, first argument will be used.
 *
 * @returns {T}
 * @template T
 */
export const memoize = (func, keyResolver) => {
	const _cacheStore = new Map()

	return (...args) => {
		const key = keyResolver ? keyResolver.apply(null, args) : args[0]

		if (_cacheStore.has(key)) {
			return _cacheStore.get(key)
		}
		const result = func.apply(null, args)
		_cacheStore.set(key, result)
		return result
	}
}

/**
 * @param {string} inputString
 */
export const evaluate = (inputString) => {
	try {
		const _inputString = inputString.replace(/-([a-zA-Z])/, (v) =>
			v.slice(1).toUpperCase(),
		)
		const output = eval(_inputString)
		// console.log(output, typeof output)
		if (typeof output === "number")
			return output.toPrecision(10).replace(/\.?0+$/g, "")
		return output
	} catch (error) {
		console.warn("function called from calculator wrong format", error)
		return { error }
	}
}

/**
 * @param {T} func
 * @param {number} delay
 *
 * @returns {T}
 *
 * @template T
 */
export const debounce = (func, delay) => {
	let debounceTimer
	return function (...args) {
		const context = this
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			func.apply(context, args)
		}, delay)
	}
}

/**
 * @param {string} str
 */
export const findHyphenPositions = (str) => {
	// if (str.split("~").length !== 3)
	// 	throw new Error("str must contain only 2 `~`")
	const firstHyphen = str.match(/~/).index
	const secondHyphen = str
		.split("")
		.reverse()
		.findIndex((v) => v === "~")

	return [firstHyphen, secondHyphen]
}
