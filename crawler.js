let RESULT, HEADS

const [
	cors_api,
	wiki_url,
	none,
	[TABLE_HEAD, TABLE_BODY, LOADERTEXT],
	SCHOOL_TYPES,
	TABLE_ROWS
] = [
		'https://gss-cors.glitch.me/?url=',
		'https://en.wikipedia.org/wiki/List_of_senior_high_schools_in_Ghana',
		'Unknown',
		['thead tr', 'tbody', '.loading-text'].map(q => document.querySelector(q)),
		new Set(),
		[]
	]


const RETRIEVER =
	fetch(cors_api + wiki_url)
		.then(res => {
			LOADERTEXT.textContent = 'Organizing data...'
			return res.text()
		})
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
			for (i = 1; i < tables.length; i++) {
				const table = tables[i + '']
				const tbody = table.children['0']

				const region = getRegion(table)
				heads = getHeaders(tbody)

				result[region] = {}

				let district
				for (let row of tbody.children) {
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
						TABLE_ROWS.push(createTableRow(
							Object.assign(row_data, { region, district })
						))
					}
				}

				if (!result[region][none].length) {
					delete result[region][none]
				}

				if ('' in result[region]) {
					// !result[region][''].length ?
					delete result[region][''] //: null
				}
			}
			// assign global variables
			RESULT = result
			HEADS = heads
			return { heads, result }
		})
		.catch(({ message }) => {
			// console.log(message)
			alert('Couldn\'t load page. Please check your internet connection and reload.')
		})
		.finally(() => {
			document.body.classList.remove('loading')
		})


// Functions

String.prototype.toTitleCase = function () {
	return this
		?
		this
			.split(' ')
			.map(w => w ? w[0].toUpperCase() + w.substr(1).toLowerCase() : w)
			.join(' ')
		:
		this
}

function flattenText(string) {
	return string
		.replace(/\[.+\]|\n/gi, '')
		.replace(/ and ranked as.+\{?\{?.+\}?\}?/, '')
}

function getHeaders(thead) {
	const headers = Array(...thead.firstElementChild.children)

	return headers.reduce((output, val, index) => {
		output[flattenText(val.textContent)] = index
		return output
	}, {})
}

function getRegion(table) {
	let sibling = table.previousElementSibling
	const region = sibling.localName == 'p' ?
		'Ashanti Region' :
		sibling.innerText

	return region.replace(/\[.+\]/, '')
}

function getDistrict(row) {
	return Object
		.values(row.getElementsByTagName('a'))
		.map(anchor => anchor.innerText)
		.join(' and ')
}

function getRowData(row, src_obj) {
	const data = {}
	for (let key in src_obj) {
		if (key) {
			elm = row[src_obj[key] + '']
			let text = flattenText(
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

function createTableRow(obj) {
	const vals = Object.values(obj)
	const arr = vals.slice(0, vals.length - 2)

	const tr = document.createElement('tr')
	arr.forEach(info => tr.insertAdjacentHTML(
		'beforeend',
		`<td>${info}</td>`
	))
	// set data attributes for easy filtering
	// these data attributes can be accessed from the element's dataset object
	tr.setAttribute('data-region', obj.region)
	tr.setAttribute('data-district', obj.district)
	tr.setAttribute('data-type', vals[1])
	tr.setAttribute('title', `${obj.region} - ${obj.district}`)
	// fix links
	correctLink(...tr.getElementsByTagName('a'))

	return tr
}

function correctLink(...anchors) {
	for (let anchor of anchors) {
		const href = anchor.getAttribute('href')
		anchor.setAttribute(
			'href',
			(!href.startsWith('http') ? 'https://wikipedia.org/' : '') + href
		)
		anchor.setAttribute('target', '_blank')
	}
}
