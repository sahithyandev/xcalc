/* eslint-disable no-debugger */
import { evaluate, debounce, isLocal } from "./utils"
import * as _FUNCTIONS from "../src/runners/index"

// TODO think of a good name for ie
/**
 * @description Normally, those runner functions return an object. This function creates a new instance of those runners which return only thier mainValue
 * @param {Function} runner
 */
const ie = (runner) => {
	const x = function (...args) {
		const output = runner.apply(null, args)
		if (typeof output.mainValue === "number") return output.mainValue
		// if (output.formattedValue) return output.formattedValue
		return output
		// return runner.apply(null, args) // TODO .mainValue
	}
	x.meta = runner.meta
	return x
}

const FUNCTIONS = Object.keys(_FUNCTIONS).map((key) => {
	const func = ie(_FUNCTIONS[key])
	window[key] = func
	return func
})
console.log("available functions: ", FUNCTIONS)

/**
 * @description Replaces text selection in a inputElement with another text
 *
 * @param {HTMLInputElement} inputElement
 * @param {string} text
 */
const replaceText = (inputElement, text) => {
	const start = inputElement.selectionStart
	const end = inputElement.selectionEnd
	const allText = inputElement.value

	return allText.substring(0, start) + text + allText.substring(end)
}

const _STATE = {
	inputString: "",
	functionsDetailedView: null,
	callbacks: {
		set: {
			/**
			 * @param {string} newValue
			 */
			inputString: (oldValue, newValue) => {
				/** @type {HTMLInputElement} */
				const inputDisplay = document.getElementById("input-display")

				const formattedInputValue = newValue.replace(/~/g, "")
				inputDisplay.value = formattedInputValue

				// TODO select the characters between two ~
				// if (newValue.split("~").length > 2) {
				// 	const [first, last] = findHyphenPositions(newValue)
				// 	// inputDisplay.setSelectionRange(first, last)
				// }
				updateOutput(formattedInputValue)
			},
			/**
			 * @param {boolean} oldValue
			 * @param {boolean} newValue
			 */
			functionsDetailedView: (oldValue, newValue) => {
				document.getElementById("function-buttons").classList.toggle("detailed")
			},
		},
	},
}

const STATE = new Proxy(_STATE, {
	get: function (target, prop) {
		if (target.callbacks?.get && target.callbacks?.get[prop]) {
			target.callbacks.get[prop].apply(null)
		}

		return target[prop]
	},
	set: function (obj, prop, value) {
		if (obj.callbacks?.set && obj.callbacks?.set[prop]) {
			const oldValue = obj[prop]
			const result = obj.callbacks.set[prop](oldValue, value)

			if (!result && result != undefined) return false
		}
		obj[prop] = value
		return true
	},
})

const createButton = ({ text, id, description, clickListener }) => {
	if (!text) throw new Error("Button must have text inside")
	description = description || ""

	const button = document.createElement("button")
	button.innerHTML = text
	if (id) {
		button.id = id
	} else {
		button.id = text
		console.warn(`button with ${text} doesn't have an id`)
	}
	button.dataset.description = description
	if (clickListener) {
		button.onclick = clickListener
	}

	return button
}

function addBasicButtons() {
	const container = document.querySelector("#basic-buttons")
	const buttons = [
		{
			name: "clear",
			displayText: "CLEAR",
			/**
			 * @param {MouseEvent} event
			 */
			onpress: (event) => {
				console.log(event)
				event.stopPropagation()
				STATE.inputString = ""
			},
		},
		{ name: "add", displayText: "+" },
		{
			name: "subtract",
			displayText: "-",
		},
		{
			name: "multiply",
			displayText: "*",
		},
		{
			name: "divide",
			displayText: "/",
		},
	]

	container.append(
		...buttons.map((buttonObj) => {
			return createButton({
				text: buttonObj.displayText,
				id: buttonObj.displayText,
				clickListener: buttonObj.onpress,
			})
		}),
	)

	{
		const equalButton = document.createElement("button")
		equalButton.innerHTML = "="
		equalButton.id = "equal-button"
		equalButton.style.setProperty("--background-color", "var(--theme-color)")
		container.append(equalButton)
	}

	const inputDisplay = document.getElementById("input-display")
	container.onclick = (event) => {
		const replacement = event.target.innerText
		STATE.inputString = replaceText(inputDisplay, replacement)
	}
}

function addFunctionButtons() {
	const container = document.querySelector("#function-buttons")

	container.append(
		...FUNCTIONS.map((functionObj) => {
			const name = functionObj.meta.name
			return createButton({ text: name, id: name })
		}),
	)

	const inputDisplay = document.getElementById("input-display")
	container.onclick = (event) => {
		const buttonId = event.target.id
		const clickedFunction = FUNCTIONS.find((functionObj) => {
			return functionObj.meta.name === buttonId
		})
		const functionUsageExample = clickedFunction.meta.usage
		STATE.inputString = replaceText(inputDisplay, functionUsageExample)
	}
}

document.body.onload = () => {
	if (isLocal()) {
		// STATE.inputString = "factors(100)"
	}
	// STATE.functionsDetailedView = true
	addFunctionButtons()
	addBasicButtons()
}

const calculatorOutputFormatter = (value) => {
	if (value === undefined) return ""
	if (!(value instanceof Object)) {
		return value
	}
	console.log(value)

	const _value = value.formattedValue || value.mainValue

	if (_value instanceof Array) {
		return _value.join(", ").concat(`\n[${_value.length}]`)
	}

	// otherwise return normal
	return _value
}

/**
 * @param {string} newInputString
 */
function updateOutput(newInputString) {
	const outputDisplay = document.getElementById("output-display")

	const evaluatedInput = evaluate(newInputString)
	if (evaluatedInput instanceof Object && "error" in evaluatedInput) {
		// it's an error
		outputDisplay.innerHTML = evaluatedInput.error.message
	} else {
		outputDisplay.innerHTML = calculatorOutputFormatter(evaluatedInput)
	}
}

document.getElementById("input-display")?.addEventListener(
	"input",
	debounce((event) => {
		STATE.inputString = event.target.value
	}, 500),
)
