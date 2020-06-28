const [
	// region_filter, 
	type_filter, 
	district_filter
] = [
	// '#region', 
	'#type', 
	'#district'
]
.map(query => document.querySelector(query + ' .options'))

const filters = {
	Region: ['All', filterTableByRegion], 
	Type: ['All', filterTableByType], 
	District: ['All', filterTableByDistrict]
}

retriever.then(({heads, result}) => {
	// const regions = 
	// 	Object.keys(result)
	// 	.reduce((output, key) => {
	// 		output.push(`<option value="${key}">${key}</option>`)
	// 		return output
	// 	}, [])

	setOptions('#region', Object.keys(result))

	// display the table according to results retrieved from source
	renderTable(result)
	console.log(heads)

	/*
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
	*/
})
.catch(({message}) => console.log(message))

function resetOptions (elm) {
	all = document.createElement('p')
	all.className = 'option locked selected'
	all.innerText = 'All'
	all.addEventListener('click', selectFilter)
	elm.appendChild(all)
}

function setOptions (filter_name, arr) {
	console.log(arr)
	const filter = document.querySelector(filter_name + ' .options')

	filter.innerHTML = ''
	resetOptions(filter)

	arr.forEach(item => {
		const option = document.createElement('p')
		option.classList.add('option')
		option.innerText = item
		option.addEventListener('click', selectFilter)
		filter.appendChild(option)
	})
}

function selectFilter () {
	if (!this.classList.contains('selected')) {
		this
			.parentNode
			.querySelector('.selected')
			.classList
			.toggle('selected')

		this
			.classList
			.toggle('selected')

		const select = this
			.parentNode
			.previousElementSibling
			.innerText

		filters[select][0] = this.innerText

		document
			.querySelector('#res-' + select.toLowerCase())
			.innerText = this.innerText === 'All' ? 
				'All' + this.innerText : 
					this.innerText

		// get filter items
		filters[select][1]()
	}
}

function getTypeFilterOptions (region) {
	return Object.values(global_res[region])
		.flat(2)
		.reduce((output, val) => {
			output[0].add(val[Object.keys(global_heads)['1']])
			output[1].push(Object.values(val))
			return output
		}, [new Set(), []])
}

function filterTableByRegion () {
	const region = filters.Region[0]
	// set district and type filters from selected region...
	setOptions('#district', Object.keys(global_res[region]))
	// gets data for both the type filter and table body
	const data = getTypeFilterOptions(region)
	setOptions('#type', data[0])
	// then filter table
	table_body.innerHTML = ''
	data[1].forEach(row => populateTableBody(row))
}

function filterTableByDistrict () {
	const {Region, District, Type} = filters
	if (District[0] !== 'All') {
		const filter = global_res[Region[0]][District[0]]
		table_body.innerHTML = '' // resets table
		filter.forEach(obj => populateTableBody(Object.values(obj)))
	}
	// reset type filter
	setOptions('#type', getTypeFilterOptions(Region[0])[0])
	if (Type[0] !== 'All') {
		console.log('District func transferring task...')
		filterTableByType()
	}
}

function filterTableByType () {
	const {Region, District, Type} = filters
	const region = global_res[Region[0]]
	table_body.innerHTML = '' // resets table
	// populate table based on passed checks
	Object.entries(region).forEach(entry => {
		const [district, values] = entry
		if (District[0] === 'All' || (District[0] !== 'All' && District[0] === district)) {
			for (let obj of values) {
				// check if object type matches the filter type selected
				if (obj[Object.keys(global_heads)['1']] === Type[0] || Type[0] === 'All') {
					populateTableBody(Object.values(obj))
				}
			}
		}
	})
}

// bind event listeners
for (opt of document.getElementsByClassName('option locked')) {
	opt.addEventListener('click', selectFilter)
}

for (opt of document.getElementsByClassName('header')) {
	opt.addEventListener('click',  function () {
		this.parentNode.classList.toggle('collapsed')
	})
}
