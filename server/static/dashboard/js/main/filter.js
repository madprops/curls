App.setup_filter = () => {
    let filter = DOM.el(`#filter`)

    DOM.ev(filter, `input`, (e) => {
        if (e.key === `Escape`) {
            App.clear_filter()
        }

        App.filter()
    })

    App.filter_debouncer = App.create_debouncer(App.do_filter, App.filter_debouncer_delay)
    filter.value = ``

    let button = DOM.el(`#filter_button`)

    let lines = [
        `Click to show the filter menu`,
        `Middle Click to clear`,
    ]

    button.title = lines.join(`\n`)

    DOM.evs(button, [`click`, `contextmenu`], (e) => {
        App.show_filter_menu(e)
        e.preventDefault()
    })

    DOM.ev(button, `auxclick`, (e) => {
        if (e.button === 1) {
            App.clear_filter()
        }
    })
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

    if (value.startsWith(`[owned]`)) {
        special = App.get_owned_items()
        is_special = true
    }
    else if (value.startsWith(`[today]`)) {
        special = App.get_today_items()
        is_special = true
    }
    else if (value.startsWith(`[week]`)) {
        special = App.get_week_items()
        is_special = true
    }
    else if (value.startsWith(`[month]`)) {
        special = App.get_month_items()
        is_special = true
    }
    else if (value.startsWith(`[curl]`)) {
        scope = `curl`
        is_special = true
    }
    else if (value.startsWith(`[status]`)) {
        scope = `status`
        is_special = true
    }

    if (is_special) {
        value = value.split(` `).slice(1).join(` `)
    }

    if (!value && !is_special) {
        App.refresh_items()
        return
    }

    if ((scope !== `all`) && !value) {
        return
    }

    function check (curl, status, updated) {
        return curl.includes(value) || status.includes(value) || updated.includes(value)
    }

    function hide (el) {
        el.classList.add(`hidden`)
    }

    function show (el) {
        el.classList.remove(`hidden`)
    }

    for (let el of els) {
        let item = App.get_item(el.dataset.curl)
        let curl = item.curl.toLowerCase()
        let status = item.status.toLowerCase()
        let updated = item.updated.toLowerCase()

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

App.filter_owned = () => {
    App.set_filter(`[owned]`)
    App.do_filter()
}

App.filter_today = () => {
    App.set_filter(`[today]`)
    App.do_filter()
}

App.filter_week = () => {
    App.set_filter(`[week]`)
    App.do_filter()
}

App.filter_month = () => {
    App.set_filter(`[month]`)
    App.do_filter()
}

App.filter_curl = () => {
    App.set_filter(`[curl]`)
    App.do_filter()
}

App.filter_status = () => {
    App.set_filter(`[status]`)
    App.do_filter()
}

App.set_filter = (value) => {
    let el = DOM.el(`#filter`)
    el.value = value + ` `
    el.focus()
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
        {
            text: `Week`,
            action: () => {
                App.filter_week()
            }
        },
        {
            text: `Month`,
            action: () => {
                App.filter_month()
            }
        },
        {
            text: `Curl`,
            action: () => {
                App.filter_curl()
            }
        },
        {
            text: `Status`,
            action: () => {
                App.filter_status()
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.check_filter = () => {
    let filter = DOM.el(`#filter`)

    if (filter.value) {
        App.do_filter()
    }
}

App.filter_one_curl = (curl) => {
    let filter = DOM.el(`#filter`)
    filter.value = `[curl] ${curl}`
    App.do_filter()
}