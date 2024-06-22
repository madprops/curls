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
        let  curl = DOM.el(`.item_curl`, el).innerText.toLowerCase()
        let status = DOM.el(`.item_status`, el).innerText.toLowerCase()
        let updated = DOM.el(`.item_updated`, el).innerText.toLowerCase()

        if (curl.includes(value) || status.includes(value) || updated.includes(value)) {
            el.classList.remove(`hidden`)
        }
        else {
            el.classList.add(`hidden`)
        }
    }

    App.check_first_item()
}

App.unfilter_all = () => {
    let els = DOM.els(`#container .item`)

    for (let el of els) {
        el.classList.remove(`hidden`)
    }

    App.check_first_item()
}

App.check_first_item = () => {
    let els = DOM.els(`#container .item`)
    let first = false

    for (let el of els) {
        if (!el.classList.contains(`hidden`)) {
            if (!first) {
                el.classList.add(`first_item`)
                continue
            }
        }

        el.classList.remove(`first_item`)
    }
}