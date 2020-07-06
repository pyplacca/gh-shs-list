const filters = {
	Region 	: ['All', filterTableByRegion], 
	District: ['All', filterTable],
	Type 	: ['All', filterTable], 
}

const container = document.querySelector('.container')
let sort_head = TABLE_HEAD.firstElementChild

RETRIEVER
.then(({heads, result}) => {
	setTableHeaders(Object.keys(heads))
	renderTableBody()
	setOptions('#region', Object.keys(result))
	setOptions('#type', SCHOOL_TYPES)
	document.querySelector('.results').style.display = 'block'

	// bind event listeners
	for (let opt of getClassElems('option locked')) {
		opt.addEventListener('click', selectFilter, false)
	}

	for (let opt of getClassElems('header')) {
		opt.addEventListener('click',  function () {
			this.parentNode.classList.toggle('collapsed')
		}, false)
	}

	document.querySelector('thead tr')
	.addEventListener('click', function ({target}) {
		const sort_orders = {
			'neutral': 'ascending', 
			'ascending':'descending', 
			'descending':'ascending'
		}
		// initiate sorting
		if (target.localName == 'th') {
			const order = sort_orders[target.getAttribute('sort-order')]
			target.setAttribute('sort-order', order)

			container.style.cursor = 'progress'
			renderTableBody(
				sort_by=target.innerText, 
				reversed=(order === 'descending')
			)

			if (sort_head && sort_head.innerText !== target.innerText) {
				sort_head.setAttribute('sort-order', 'neutral')
			}
			// keep track of which table head is currently used to sort the table
			sort_head = target
			container.style.cursor = 'initial'
		}
	})
})
// .catch(({message}) => {
// 	console.log(message)
// 	LOADER.parentNode.removeChild(LOADER)
// })

function sortTable(rows, by, reverse=false) {
	const len = rows.length
	
	let i = 0
	while (i < len) {
		let j = i + 1

		while (j < len) {
			const [l, r] = [i, j].map(p => rows[p].children[HEADS[by]].innerText)

			if (reverse) {
				if (r > l) {
					[rows[j], rows[i]] = [rows[i], rows[j]]
				}
			} else {
				if (r < l) {
					[rows[j], rows[i]] = [rows[i], rows[j]]
				}
			}
			j++
		}
		i++
	}
	return rows
}

function renderTableBody(sort_by='School', reversed=false) {
	// sort table rows...
	sortTable(TABLE_ROWS, by=sort_by, reverse=reversed)
	TABLE_BODY.innerHTML = ''
	// then re-insert them into the table body
	for (let row of TABLE_ROWS) {
		TABLE_BODY.appendChild(row)
	}

	return null
}

function selectFilter () {
	if (!this.classList.contains('selected')) {
		document.body.style.cursor = 'progress'
		// remove "selected" tag from perviously selected option
		this
			.parentNode
			.querySelector('.selected')
			.classList
			.toggle('selected')
		// mark selected option as "selected"
		this
			.classList
			.toggle('selected')

		// update filters object with selected option
		const select = this
			.parentNode
			.previousElementSibling
			.innerText

		filters[select][0] = this.innerText

		document
			.querySelector('#res-' + select.toLowerCase())
			.innerText = this.innerText === 'All' ? 
				`All ${select}s` : 
					this.innerText

		filters[select][1]()
	}
}

function setTableHeaders(arr) {
	// set table headers
	arr.forEach((th, i) => {
		TABLE_HEAD.insertAdjacentHTML(
			'beforeend', 
			`<th sort-order=${!i ? 'ascending' : 'neutral'}>${th}</th>`
		)
	}) 
}

function setOptions (filter_name, arr, reset=false) {
	const filter = document.querySelector(filter_name + ' .options')

	if (reset) {
		resetOptions(filter)
	}

	Array(...arr).sort().forEach(item => {
		if (item) {
			const option = document.createElement('p')
			option.classList.add('option')
			option.innerText = item
			option.addEventListener('click', selectFilter)
			filter.appendChild(option)
		}
	})
}

function resetOptions(category) {
	category.innerHTML = ''
	const all = document.createElement('p')
	all.innerText = 'All'
	all.classList.add('option', 'locked', 'selected')
	all.addEventListener('click', selectFilter)
	category.appendChild(all)
}

function filterTableByRegion() {
	// update district options with district of selected region
	const region = filters.Region[0]
	setOptions(
		'#district', 
		region in RESULT ? 
			Object.keys(RESULT[region])
			.filter(r => (r.match(/district/gi) || '').length < 2) : 
		[], 
		true
	)
	filters.District[0] = 'All'
	filterTable()
}

function filterTable() {
	const [region, district, type] = Object.values(filters).map(v => v[0])
	
	for (let tr of TABLE_BODY.children)	 {
		const [
			region_attr, district_attr, type_attr
		] = [
			'region', 'district', 'type'
		].map(f => tr.getAttribute(f))

		if (
			(region === region_attr || region === 'All') &&
			(district === district_attr || district === 'All') &&
			(type_attr.includes(type) || type === 'All')
		) {
			tr.classList.replace('hide', 'show')
			// an array of regional districts for selected region if changed
		} else {
			tr.classList.add('hide')
		}
	}
	document.body.style.cursor = 'unset'
}

const getClassElems = cls => document.getElementsByClassName(cls);
