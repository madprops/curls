App.get_date_mode = () => {
    return localStorage.getItem(`date_mode`) || `12`
}

App.insert_items = (items) => {
    App.items = items
    App.items.map(x => x.missing = false)
    let missing = App.get_missing()
    App.items.push(...missing)
    App.add_dates_to_items()
    App.refresh_items()
}

App.refresh_items = (items = App.items, check_filter = true) => {
    App.clear_container()
    App.sort_items(items)

    for (let item of items) {
        App.insert_item(item)
    }

    App.unselect()
    App.check_empty()

    if (check_filter) {
        App.check_filter()
    }
}

App.insert_item = (item) => {
    let container = DOM.el(`#container`)
    let el = DOM.create(`div`, `item`)
    let item_icon = DOM.create(`div`, `item_icon`)
    item_icon.title = `Click to show a menu`

    let canvas = DOM.create(`canvas`, `item_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    item_icon.append(canvas)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_status = DOM.create(`div`, `item_status`)
    let item_updated = DOM.create(`div`, `item_updated`)

    item_curl.textContent = item.curl
    item_curl.title = item.curl
    let status = item.status || `Not updated yet`
    item_status.innerHTML = App.sanitize(status)
    App.urlize(item_status)

    item_updated.textContent = item.updated_text
    item_updated.title = `Click to toggle between 12 and 24 hour formats`

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

App.show_item_menu = (e) => {
    let items = [
        {
            text: `Copy`,
            action: () => {
                App.copy_item(e)
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.item_to_top = (curl) => {
    let el = App.get_item(curl).element

    if (el) {
        let container = DOM.el(`#container`)
        container.prepend(el)
    }
}

App.item_to_bottom = (curl) => {
    let el = App.get_item(curl).element

    if (el) {
        let container = DOM.el(`#container`)
        container.append(el)
    }
}

App.get_missing = () => {
    let used = App.get_used_curls()
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
    let date_mode = App.get_date_mode()
    date_mode = date_mode === `12` ? `24` : `12`
    localStorage.setItem(`date_mode`, date_mode)
    App.refresh_items()
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