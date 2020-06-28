const [
	cors_api,
	url,
	list,
	flatText,
	none,
	[table_head, table_body, loader]
] = [
	'https://cors-anywhere.herokuapp.com/',
	'https://en.wikipedia.org/wiki/List_of_senior_high_schools_in_Ghana',
	(collection) => Array(...collection),
	(string) => {
		return string
			.replace(/\[\d*\]|\n/gi, '')
			.replace(/ and ranked as.+\{\{.+\}\}/, '')
	},
	'Unknown',
	['thead tr', 'tbody', '#loader'].map(q => document.querySelector(q))
]

let global_res, global_heads

const retriever = 
	fetch(cors_api + url)
	.then(res => res.text())
	.then(text => {
		const [dom, result] = [
			new DOMParser()
			.parseFromString(text, 'text/html')
			.body,
			{}
		]
		const tables = dom.getElementsByTagName('table')

		// console.dir(tables)
		let heads
		for (i=1; i < tables.length; i++) {
			const table = tables[i + '']
			const tbody = table.children['0']
				
			const region = getRegion(table)
			heads = getHeaders(tbody)

			result[region] = {}

			let district
			for (row of tbody.children) {
				const childs = row.children

				if (childs.length < 3) {
					district = getDistrict(childs['0'])
					result[region][district] = []
					continue
				}
				
				if (!district) {
					district = none
					result[region][district] = []
				}

				if (childs['0'].localName !== 'th') {
					let row_data = getRowData(childs, heads)
					result[region][district].push(
						row_data
					)
					populateTableBody(Object.values(row_data))
				}
			}

			if (!result[region][none].length) {
				delete result[region][none]
			}

			if ('' in result[region]) {
				!result[region][''].length ? 
					delete result[region][''] : null
			}

		}
		
		setTableHeaders(Object.keys(heads))
		// remove loader
		loader.parentNode.removeChild(loader)
		// assign global variables
		global_res = result
		global_heads = heads
		return {heads, result}
	})
	.catch(({message}) => {
		console.log(message)
		loader.parentNode.removeChild(loader)
		alert('Couldn\'t load page. Please check your internet connection and reload.')
	})


// Functions

function getHeaders(thead) {
	const headers = list(thead.firstElementChild.children)

	return headers.reduce((output, val, index) => {
		output[flatText(val.textContent)] = index
		return output
	}, {})
}

function getRegion(table) {
	let sibling = table.previousElementSibling
	const region = sibling.localName == 'p' ? 
		'Ashanti Region' : 
		sibling.innerText

	return region.replace('[edit]', '')
}

function getDistrict(row) {
	return Object
		.values(row.getElementsByTagName('a'))
		.map(anchor => anchor.innerText)
		.join(' and ')
}

function getRowData(row, src_obj) {
	const data = {}
	for (key in src_obj) {
		if (key) {
			const text = flatText(
				// ['School', 'Website'].includes(key) ? 
				// 	elm.innerHTML : 
				// 	elm.innerText
				row[src_obj[key]+''].innerText
			)
			data[key] = text == 'public' ? 'Public School' : text
		}
	}
	return data
}

function setTableHeaders(arr) {
	// set table headers
	arr.forEach(th => {
		table_head.insertAdjacentHTML('beforeend', `<th>${th}</th>`)
	}) 
}

function populateTableBody(arr) {
	const tr = document.createElement('tr')
	arr.forEach(info => tr.insertAdjacentHTML(
		'beforeend', `<td>${info}</td>`
	))
	table_body.appendChild(tr)
}
