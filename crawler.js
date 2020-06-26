const [
	cors_api,
	url,
	list,
	flatText,
	global_res
] = [
	'https://cors-anywhere.herokuapp.com/',
	'https://en.wikipedia.org/wiki/List_of_senior_high_schools_in_Ghana',
	(collection) => Array(...collection),
	(string) => string.replace(/\[\d*\]|\n/gi, ''),
	{}
]

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

		for (i=1; i < tables.length; i++) {
			const table = tables[i + '']
			const tbody = table.children['0']
				
			const [heads, region] = [
				getHeaders(tbody), 
				getRegion(table)
			]
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
					district = 'Unknown'
					result[region][district] = []
				}

				if (childs['0'].localName !== 'th') {
					result[region][district].push(
						getRowData(childs, heads)
					)
				}
			}

			if (!result[region][''].length) {
				delete result[region]['']
			}
		}
		global_res = result
		return result
	})
	.catch(({message}) => {
		console.log(message)
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

function getRowData(row, hash) {
	const data = {}
	for (key in hash) {
		if (key) {
			data[key] = flatText(
				row[hash[key]+''].innerText
			)
		}
	}
	return data
}


// function filterBy(option) {
// 	let [key, value] = Object.entries(option)
// 	key = k.toLowerCase()
// 	if (key == 'region') {
// 		return result[value]
// 	} else if (key == 'district') {
// 		const output = []
// 		for (region in result) {
// 			if result[region]
// 		}
// 	}
// }
