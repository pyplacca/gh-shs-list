const filters = {
	Region: ['All', filterTableByRegion], 
	District: ['All', filterTable],
	Type: ['All', filterTable], 
}

RETRIEVER
.then(({heads, result}) => {
	setOptions('#region', Object.keys(result))
	setOptions('#type', SCHOOL_TYPES)
})
.catch(({message}) => {
	console.log(message)
	LOADER.parentNode.removeChild(LOADER)
})


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

		// filter table and category filters if necessary
		filters[select][1]()
	}
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
		region in RESULT ? Object.keys(RESULT[region]) : [], 
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

// bind event listeners
for (let opt of getClassElems('option locked')) {
	opt.addEventListener('click', selectFilter)
}

for (let opt of getClassElems('header')) {
	opt.addEventListener('click',  function () {
		this.parentNode.classList.toggle('collapsed')
	})
}
