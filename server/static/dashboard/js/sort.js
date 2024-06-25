App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    DOM.ev(sort, `change`, (e) => {
        App.change_sort(e)
    })

    sort.value = App.load_sort()
}

App.change_sort = (e) => {
    let mode = e.target.value
    localStorage.setItem(`sort`, mode)
    App.refresh_items()
}

App.sort_if_order = () => {
    if (App.get_sort() == `order`) {
        App.refresh_items()
    }
}

App.sort_items = (items) => {
    let mode = App.get_sort()

    if (mode === `order`) {
        let used_curls = App.get_used_curls()

        items.sort((a, b) => {
            return used_curls.indexOf(a.curl) - used_curls.indexOf(b.curl)
        })
    }
    else if (mode === `newest`) {
        items.sort((a, b) => {
            let compare = b.updated.localeCompare(a.updated)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    if (mode === `oldest`) {
        items.sort((a, b) => {
            let compare = a.updated.localeCompare(b.updated)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `ascending`) {
        items.sort((a, b) => {
            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `descending`) {
        items.sort((a, b) => {
            return b.curl.localeCompare(a.curl)
        })
    }
    else if (mode === `short`) {
        // Sort by length and then alpha
        items.sort((a, b) => {
            let diff = a.curl.length - b.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `long`) {
        // Sort by length and then alpha
        items.sort((a, b) => {
            let diff = b.curl.length - a.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
}

App.load_sort = () => {
    let defvalue = `newest`
    let saved = localStorage.getItem(`sort`) || defvalue
    let values = Array.from(sort.options).map(option => option.value)

    if (!values.includes(saved)) {
        saved = defvalue
    }

    return saved
}

App.get_sort = () => {
    return DOM.el(`#sort`).value
}