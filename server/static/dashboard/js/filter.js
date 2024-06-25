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

    let button = DOM.el(`#filter_button`)

    DOM.ev(button, `click`, (e) => {
        App.show_filter_menu(e)
    })
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
    let owned = value === `[owned]`
    let today = value === `[today]`
    let special = []

    if (owned) {
        special = App.get_owned_items()
    }
    else if (today) {
        special = App.get_today_items()
    }

    let is_special = owned || today

    if (!value) {
        App.unfilter_all()
        return
    }

    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    function hide (el) {
        el.classList.add(`hidden`)
    }

    function unhide (el) {
        el.classList.remove(`hidden`)
    }

    for (let el of els) {
        let item = App.get_item(el.dataset.curl)
        let curl = item.curl.toLowerCase()
        let status = item.status.toLowerCase()
        let updated = item.updated.toLowerCase()

        if (is_special) {
            if (special.find(s => s.curl === item.curl)) {
                unhide(el)
            }
            else {
                hide(el)
            }
        }
        else {
            if (curl.includes(value) || status.includes(value) || updated.includes(value)) {
                unhide(el)
            }
            else {
                hide(el)
            }
        }
    }

    App.check_visible()
}

App.unfilter_all = () => {
    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    for (let el of els) {
        el.classList.remove(`hidden`)
    }

    App.check_visible()
}

App.filter_owned = () => {
    App.set_filter(`[owned]`)
    App.do_filter()
}

App.filter_today = () => {
    App.set_filter(`[today]`)
    App.do_filter()
}

App.set_filter = (value) => {
    DOM.el(`#filter`).value = value
}

App.show_filter_menu = (e) => {
    let items = [
        {
            text: `Clear`,
            action: () => {
                App.clear_filter()
            }
        },
        {
            text: `Owned`,
            action: () => {
                App.filter_owned()
            }
        },
        {
            text: `Today`,
            action: () => {
                App.filter_today()
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}