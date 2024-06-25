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
    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    let value = DOM.el(`#filter`).value.toLowerCase().trim()
    let is_special = false
    let special = []

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

    if (is_special) {
        value = value.split(` `).slice(1).join(` `)
    }

    function hide (el) {
        el.classList.add(`hidden`)
    }

    function unhide (el) {
        el.classList.remove(`hidden`)
    }

    function check (curl, status, updated) {
        return curl.includes(value) || status.includes(value) || updated.includes(value)
    }

    for (let el of els) {
        let item = App.get_item(el.dataset.curl)
        let curl = item.curl.toLowerCase()
        let status = item.status.toLowerCase()
        let updated = item.updated.toLowerCase()

        if (is_special) {
            if (special.find(s => s.curl === item.curl)) {
                if (check(curl, status, updated)) {
                    unhide(el)
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

App.filter_week = () => {
    App.set_filter(`[week]`)
    App.do_filter()
}

App.filter_month = () => {
    App.set_filter(`[month]`)
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
    ]

    NeedContext.show({items: items, e: e})
}