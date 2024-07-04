App.setup_filter = () => {
    let filter = DOM.el(`#filter`)

    DOM.ev(filter, `keydown`, (e) => {
        if (e.key === `Escape`) {
            App.clear_filter()
        }

        App.filter()
    })

    App.filter_debouncer = App.create_debouncer(App.do_filter, App.filter_debouncer_delay)
    filter.value = ``

    let button = DOM.el(`#filter_button`)
    App.filter_mode = App.load_filter()

    Combo.register({
        title: `Filter Modes`,
        items: App.filter_modes,
        value: App.filter_mode,
        element: button,
        default: App.default_filter,
        action: (value) => {
            App.change_filter(value)
        },
        get: () => {
            return App.filter_mode
        },
    })
}

App.load_filter = () => {
    App.load_modes(`filter`, App.filter_modes, App.default_filter)
}

App.change_filter = (value) => {
    if (App.filter_mode === value) {
        return
    }

    App.filter_mode = value
    App.focus_filter()
    App.do_filter()
    localStorage.setItem(`filter`, value)
}

App.unfilter_all = () => {
    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    for (let el of els) {
        el.classList.remove(`hidden`)
    }
}

App.clear_filter = () => {
    DOM.el(`#filter`).value = ``
    App.unfilter_all()
}

App.filter = () => {
    App.filter_debouncer.call()
}

App.do_filter = () => {
    let els = App.get_container_items()

    if (!els.length) {
        return
    }

    let value = DOM.el(`#filter`).value.toLowerCase().trim()
    let is_special = false
    let special = []
    let scope = `all`

    if (App.filter_mode === `owned`) {
        special = App.get_owned_items()
        is_special = true
    }
    else if (App.filter_mode === `today`) {
        special = App.get_today_items()
        is_special = true
    }
    else if (App.filter_mode === `week`) {
        special = App.get_week_items()
        is_special = true
    }
    else if (App.filter_mode === `month`) {
        special = App.get_month_items()
        is_special = true
    }
    else if (App.filter_mode === `curl`) {
        scope = `curl`
        is_special = true
    }
    else if (App.filter_mode === `status`) {
        scope = `status`
        is_special = true
    }
    else if (App.filter_mode === `date`) {
        scope = `date`
        is_special = true
    }

    if (!value && !is_special) {
        App.unfilter_all()
        return
    }

    if ((scope !== `all`) && !value) {
        App.unfilter_all()
        return
    }

    function check (curl, status, updated) {
        return curl.includes(value) || status.includes(value) || updated.includes(value)
    }

    function hide (el) {
        DOM.hide(el)
    }

    function show (el) {
        DOM.show(el)
    }

    for (let el of els) {
        let item = App.get_item(el.dataset.curl)
        let curl = item.curl.toLowerCase()
        let status = item.status.toLowerCase()
        let updated = item.updated_text.toLowerCase()

        if (scope === `curl`) {
            if (curl.includes(value)) {
                show(el)
            }
            else {
                hide(el)
            }
        }
        else if (scope === `status`) {
            if (status.includes(value)) {
                show(el)
            }
            else {
                hide(el)
            }
        }
        else if (scope === `date`) {
            if (updated.includes(value)) {
                show(el)
            }
            else {
                hide(el)
            }
        }
        else if (is_special) {
            if (special.find(s => s.curl === item.curl)) {
                if (check(curl, status, updated)) {
                    show(el)
                }
                else {
                    hide(el)
                }
            }
            else {
                hide(el)
            }
        }
        else {
            if (check(curl, status, updated)) {
                show(el)
            }
            else {
                hide(el)
            }
        }
    }
}

App.check_filter = () => {
    let filter = DOM.el(`#filter`)

    if (filter.value || (App.filter_mode !== App.default_filter)) {
        App.do_filter()
    }
}

App.focus_filter = () => {
    DOM.el(`#filter`).focus()
}