/*

This is the filter for the container

*/

const Filter = {
    debouncer_delay: 250,
    default_mode: `all`,
}

Filter.modes = [
    {value: `all`, name: `All`, info: `Show all curls`},
    {value: App.separator},
    {value: `today`, name: `Today`, info: `Show the curls that changed today`},
    {value: `week`, name: `Week`, info: `Show the curls that changed this week`},
    {value: `month`, name: `Month`, info: `Show the curls that changed this month`},
    {value: App.separator},
    {value: `curl`, name: `Curl`, info: `Filter by curl`},
    {value: `status`, name: `Status`, info: `Filter by status`},
    {value: `date`, name: `Date`, info: `Filter by date`},
    {value: App.separator},
    {value: `owned`, name: `Owned`, info: `Show the curls that you control`},
]

Filter.setup = () => {
    let filter = DOM.el(`#filter`)

    DOM.ev(filter, `keydown`, (e) => {
        if (e.key === `Escape`) {
            Filter.clear()
        }

        Filter.filter()
    })

    Filter.debouncer = App.create_debouncer(Filter.do_filter, Filter.debouncer_delay)
    filter.value = ``

    let button = DOM.el(`#filter_button`)
    Filter.mode = Filter.load_filter()

    Combo.register({
        title: `Filter Modes`,
        items: Filter.modes,
        value: Filter.filer_mode,
        element: button,
        default: Filter.default_mode,
        action: (value) => {
            Filter.change(value)
        },
        get: () => {
            return Filter.mode
        },
    })
}

Filter.load_filter = () => {
    return App.load_modes(`filter`, Filter.modes, Filter.default_mode)
}

Filter.change = (value) => {
    if (Filter.mode === value) {
        return
    }

    Filter.mode = value
    Filter.focus()
    Filter.do_filter()
    App.save(`filter`, value)
}

Filter.unfilter = () => {
    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    for (let el of els) {
        el.classList.remove(`hidden`)
    }
}

Filter.clear = () => {
    DOM.el(`#filter`).value = ``
    Filter.unfilter()
}

Filter.filter = () => {
    Filter.debouncer.call()
}

Filter.do_filter = () => {
    Filter.debouncer.cancel()
    let els = Container.get_items()

    if (!els.length) {
        return
    }

    let value = DOM.el(`#filter`).value.toLowerCase().trim()
    let is_special = false
    let special = []
    let scope = `all`

    if (Filter.mode === `owned`) {
        special = Items.get_owned()
        is_special = true
    }
    else if (Filter.mode === `today`) {
        special = Items.get_today()
        is_special = true
    }
    else if (Filter.mode === `week`) {
        special = Items.get_week()
        is_special = true
    }
    else if (Filter.mode === `month`) {
        special = Items.get_month()
        is_special = true
    }
    else if (Filter.mode === `curl`) {
        scope = `curl`
        is_special = true
    }
    else if (Filter.mode === `status`) {
        scope = `status`
        is_special = true
    }
    else if (Filter.mode === `date`) {
        scope = `date`
        is_special = true
    }

    if (!value && !is_special) {
        Filter.unfilter()
        return
    }

    if ((scope !== `all`) && !value) {
        Filter.unfilter()
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
        let item = Items.get(el.dataset.curl)
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

Filter.check = () => {
    let filter = DOM.el(`#filter`)

    if (filter.value || (Filter.mode !== Filter.default_mode)) {
        Filter.do_filter()
    }
}

Filter.focus = () => {
    DOM.el(`#filter`).focus()
}