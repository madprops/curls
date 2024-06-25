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
        App.update(true)
    }
}

App.sort_items = (items) => {
    let mode = App.get_sort()

    if (mode === `recent`) {
        items.sort((a, b) => {
            return b.updated.localeCompare(a.updated)
        })
    }
    else if (mode === `order`) {
        let used_curls = App.get_used_curls()

        items.sort((a, b) => {
            return used_curls.indexOf(a.curl) - used_curls.indexOf(b.curl)
        })
    }
    else if (mode === `alpha_asc`) {
        items.sort((a, b) => {
            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `alpha_desc`) {
        items.sort((a, b) => {
            return b.curl.localeCompare(a.curl)
        })
    }
}

App.load_sort = () => {
    let saved = localStorage.getItem(`sort`) || `recent`
    let values = Array.from(sort.options).map(option => option.value)

    if (!values.includes(saved)) {
        saved = `recent`
    }

    return saved
}

App.get_sort = () => {
    return DOM.el(`#sort`).value
}