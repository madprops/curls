App.setup_filter = () => {
    let filter = DOM.el(`#filter`)

    DOM.ev(filter, `keyup`, (e) => {
        if (e.key === `Escape`) {
            App.clear_filter()
        }

        App.filter()
    })

    App.filter_debouncer = App.create_debouncer(App.do_filter, App.filter_debouncer_delay)
    filter.value = ``
}

App.clear_filter = () => {
    let filter = DOM.el(`#filter`)
    filter.value = ``
    App.unfilter_all()
}

App.filter = () => {
    App.filter_debouncer.call()
}

App.do_filter = () => {
    let value = DOM.el(`#filter`).value.toLowerCase().trim()

    if (!value) {
        App.unfilter_all()
        return
    }

    let els = DOM.els(`#container .item`)

    for (let el of els) {
        let values = App.get_item_values(el)
        let curl = values.curl.toLowerCase()
        let status = values.status.toLowerCase()
        let updated = values.updated.toLowerCase()

        if (curl.includes(value) || status.includes(value) || updated.includes(value)) {
            el.classList.remove(`hidden`)
        }
        else {
            el.classList.add(`hidden`)
        }
    }
}

App.unfilter_all = () => {
    let els = DOM.els(`#container .item`)

    for (let el of els) {
        el.classList.remove(`hidden`)
    }
}