const [
	cors_api,
	url,
	list,
	none,
	[TABLE_HEAD, TABLE_BODY, LOADER]
] = [
	'https://cors-anywhere.herokuapp.com/',
	'https://en.wikipedia.org/wiki/List_of_senior_high_schools_in_Ghana',
	(collection) => Array(...collection),
	'Unknown',
	['thead tr', 'tbody', '#loader'].map(q => document.querySelector(q))
]

let RESULT, HEADS
const SCHOOL_TYPES = new Set()

const RETRIEVER = 
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
					populateTableBody(Object.assign(row_data, {region, district}))
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
		RESULT = result
		HEADS = heads
		return {heads, result}
	})
	.catch(({message}) => {
		console.log(message)
		loader.parentNode.removeChild(loader)
		alert('Couldn\'t load page. Please check your internet connection and reload.')
	})


// Functions

String.prototype.toTitleCase = function () {
    return this ? 
    	this
	    	.split(' ')
	    	.map(w => w ? w[0].toUpperCase() + w.substr(1).toLowerCase() : w)
	    	.join(' ') : 
    	this
}

function flatText (string) {
	return string
		.replace(/\[\d*\]|\n/gi, '')
		.replace(/ and ranked as.+\{\{.+\}\}/, '')
}

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
			elm = row[src_obj[key]+'']
			let text = flatText(
				['School', 'Website']
				.includes(key) ? elm.innerHTML : elm.innerText
			)

			let temp
			if (key === 'Type') {
				// clean up Type data
				temp = cleanUpType(text)
			}
			data[key] = temp || text
		}
	}
	return data
}

function cleanUpType(string) {
	string = ['public', 'Public School'].includes(string) ? 'Public school' : string
	string = string == 'CommercialySchool' ? 'Commercial school' : string
	string = string.toTitleCase()

	if (string) {
		string = string
			.replace(/institute/gi, 'school')
			.match(/ ?\w+ ?school/gi)
		if (string) {
			let clean = ''
			string.forEach(sch => {
				sch = sch.trim().toTitleCase()
				if (sch) {
					clean = clean ? clean + ', ' + sch : sch
					SCHOOL_TYPES.add(sch.trim().toTitleCase())
				}
			})
			string = clean
		} else {
			SCHOOL_TYPES.add(string)
		}
	}

	return string
}

function setTableHeaders(arr) {
	// set table headers
	arr.forEach(th => {
		TABLE_HEAD.insertAdjacentHTML('beforeend', `<th>${th}</th>`)
	}) 
}

function populateTableBody(obj) {
	const vals = Object.values(obj)
	const arr = vals.slice(0, vals.length-2)

	const tr = document.createElement('tr')
	arr.forEach(info => tr.insertAdjacentHTML(
		'beforeend', 
		`<td>${info}</td>`
	))
	// set attribute for easy filtering
	tr.setAttribute('region', obj.region)
	tr.setAttribute('district', obj.district)
	tr.setAttribute('type', vals[1])
	tr.setAttribute(
		'title', 
		`Region: ${obj.region} - District: ${obj.district}`
	)
	TABLE_BODY.appendChild(tr)
	// fix hyperlinks
	const children = TABLE_BODY.children
	const last_child = children[(children.length-1) + '']
	for (anchor of last_child.getElementsByTagName('a')) {
		const href = anchor.getAttribute('href')
		anchor.setAttribute(
			'href', 
			(!href.startsWith('http') ? 'https://wikipedia.org/' : '') + href
		) 
		anchor.setAttribute('target', '_blank')
	}
}
