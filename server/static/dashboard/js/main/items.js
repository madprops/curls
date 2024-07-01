App.setup_items = () => {
    let wrap_checkbox = DOM.el(`#wrap_enabled`)
    App.wrap_enabled = App.load_wrap_enabled()
    wrap_checkbox.checked = App.wrap_enabled
    let wrap_checkbox_item = DOM.el(`#wrap_enabled_item`)

    DOM.ev(wrap_checkbox_item, `click`, () => {
        App.wrap_enabled = !App.wrap_enabled
        wrap_checkbox.checked = App.wrap_enabled
        App.save_wrap_enabled()
        App.update_items()
    })
}

App.save_wrap_enabled = () => {
    localStorage.setItem(`wrap_enabled`, App.wrap_enabled)
}

App.load_wrap_enabled = () => {
    let saved = localStorage.getItem(`wrap_enabled`) || `true`
    return saved === `true`
}

App.get_date_mode = () => {
    return localStorage.getItem(`date_mode`) || `12`
}

App.add_items = (items) => {
    let normal = App.items.filter(item => !item.missing)
    App.items = [...items]

    for (let item of normal) {
        if (App.items.find(x => x.curl === item.curl)) {
            continue
        }

        App.items.push(item)
    }

    let missing = App.get_missing()
    App.items.push(...missing)
    App.add_dates_to_items()
    App.update_items()
}

App.insert_items = (items) => {
    App.items = items
    App.items.map(x => x.missing = false)
    let missing = App.get_missing()
    App.items.push(...missing)
    App.add_dates_to_items()
    App.update_items()
}

App.update_items = (items = App.items, check_filter = true) => {
    App.clear_container()
    App.sort_items(items)

    for (let item of items) {
        App.create_element(item)
    }

    App.unselect()
    App.check_empty()

    if (check_filter) {
        App.check_filter()
    }
}

App.create_element = (item) => {
    let container = DOM.el(`#container`)
    let el = DOM.create(`div`, `item`)
    let item_icon = DOM.create(`div`, `item_icon`)
    item_icon.draggable = true

    let lines = [
        `Click to show menu`,
        `Middle Click to remove`,
    ]

    item_icon.title = lines.join(`\n`)

    let canvas = DOM.create(`canvas`, `item_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    item_icon.append(canvas)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_status = DOM.create(`div`, `item_status`)

    if (!App.wrap_enabled) {
        item_status.classList.add(`nowrap`)
    }

    let item_updated = DOM.create(`div`, `item_updated glow`)

    item_curl.textContent = item.curl
    item_curl.title = item.curl
    let status = item.status || `Not updated yet`
    item_status.innerHTML = App.sanitize(status)
    item_status.title = status
    App.urlize(item_status)

    item_updated.textContent = item.updated_text

    let lines_2 = [
        item.updated_text,
        `Click to toggle between 12 and 24 hours`,
    ]

    item_updated.title = lines_2.join(`\n`)

    el.append(item_icon)
    el.append(item_curl)
    el.append(item_status)
    el.append(item_updated)

    el.dataset.curl = item.curl

    container.append(el)
    container.append(el)

    item.element = el
}

App.get_item = (curl) => {
    return App.items.find(item => item.curl === curl)
}

App.get_missing = () => {
    let used = App.get_curls()
    let curls = used.filter(curl => !App.items.find(item => item.curl === curl))
    let missing = []

    for (let curl of curls) {
        missing.push({curl: curl, status: `Not found`, updated: `0`, missing: true})
    }

    return missing
}

App.get_missing_items = () => {
    return App.items.filter(item => item.missing)
}

App.change_date_mode = () => {
    let selected = window.getSelection().toString()

    if (selected) {
        return
    }

    let date_mode = App.get_date_mode()
    date_mode = date_mode === `12` ? `24` : `12`
    localStorage.setItem(`date_mode`, date_mode)
    App.add_dates_to_items()
    App.update_items()
}

App.get_owned_items = () => {
    let picker_items = App.get_picker_items()

    return App.items.filter(item => picker_items.find(
        picker => picker.curl === item.curl))
}

App.get_items_by_date = (what) => {
    let cleaned = []
    let now = App.now()

    for (let item of App.items) {
        let date = new Date(item.updated + `Z`)
        let diff = now - date

        if (diff < what) {
            cleaned.push(item)
        }
    }

    return cleaned
}

App.get_today_items = () => {
    return App.get_items_by_date(App.DAY)
}

App.get_week_items = () => {
    return App.get_items_by_date(App.WEEK)
}

App.get_month_items = () => {
    return App.get_items_by_date(App.MONTH)
}

App.reset_items = () => {
    App.items = []
}

App.add_dates_to_items = () => {
    for (let item of App.items) {
        let date = new Date(item.updated + `Z`)
        let date_mode = App.get_date_mode()
        let s_date

        if (date_mode === `12`) {
            s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
        }
        else if (date_mode === `24`) {
            s_date = dateFormat(date, `dd/mmm/yy - HH:MM`)
        }

        item.updated_text = s_date
    }
}

App.copy_item = (curl) => {
    let item = App.get_item(curl)

    if (!item) {
        return
    }

    let msg = `${item.curl}\n${item.status}\n${item.updated_text}`
    App.copy_to_clipboard(msg)

    function blink (icon) {
        if (!icon) {
            return
        }

        icon.classList.add(`blink`)

        setTimeout(() => {
            icon.classList.remove(`blink`)
        }, 1000)
    }

    if (App.peek_open && App.peek_curl === curl) {
        blink(DOM.el(`#peek .peek_icon`))
    }

    blink(DOM.el(`.item_icon`, item.element))
}

App.show_item_menu = (args = {}) => {
    let def_args = {
        from: `curlist`,
    }

    App.def_args(def_args, args)
    let selected = []

    if (args.from === `curlist`) {
        selected = App.get_selected_items()
        let item = App.extract_curlist_item(args.e.target)

        if (!selected.length || !selected.includes(item)) {
            App.select_curlist_item(item)
            selected = []
        }
    }

    let items = []

    if (selected.length > 1) {
        let curls = App.get_selected_curls()

        items = [
            {
                text: `Remove`,
                action: () => {
                    App.remove_selected_curls()
                }
            },
            {
                separator: true,
            },
            {
                text: `To Top`,
                action: () => {
                    App.curls_to_top(curls)
                }
            },
            {
                text: `To Bottom`,
                action: () => {
                    App.curls_to_bottom(curls)
                }
            },
        ]
    }
    else {
        items = [
            {
                text: `Copy`,
                action: () => {
                    App.copy_item(args.curl)
                }
            },
            {
                text: `Edit`,
                action: () => {
                    App.edit_curl(args.curl)
                }
            },
            {
                text: `Remove`,
                action: () => {
                    App.remove_curl(args.curl)
                }
            },
            {
                separator: true,
            },
            {
                text: `To Top`,
                action: () => {
                    App.curls_to_top([args.curl])
                }
            },
            {
                text: `To Bottom`,
                action: () => {
                    App.curls_to_bottom([args.curl])
                }
            },
        ]
    }

    NeedContext.show({
        items: items, e: args.e, after_hide: () => {
            App.focus_curlist()
        }
    })
}