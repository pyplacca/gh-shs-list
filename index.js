retriever.then(result => {
	const regions = 
		Object.keys(result)
		.reduce((output, key) => {
			output.push(`<option value="${key}">${key}</option>`)
			return output
		}, [])

	const dropdown = new DOMParser().parseFromString(
		`
			<div class="custom-select">
				 <select>
				 	${
				 		regions.join('')
				 	}
				</select> 
			</div>
		`,
		'text/html'
	).body.firstElementChild

	customizeSelect(dropdown)
	document.body.firstElementChild.appendChild(dropdown)
})
.catch(({message}) => console.log(message))
