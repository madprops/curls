App.setup_items = () => {
    App.date_mode = localStorage.getItem(`date_mode`) || `12`
}

App.insert_items = (items) => {
    App.clear_container()
    App.last_items = items
    let missing = App.get_missing()
    App.last_missing = missing
    App.items = [...items, ...missing]
    App.sort_items(App.items)

    for (let item of App.items) {
        App.insert_item(item)
    }

    App.unselect()

    if (App.items.length) {
        App.container_not_empty()
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

    let date = new Date(item.updated + "Z")
    let s_date

    if (App.date_mode === `12`) {
        s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
    }
    else if (App.date_mode === `24`) {
        s_date = dateFormat(date, `dd/mmm/yy - HH:MM`)
    }

    item_updated.textContent = s_date
    item_updated.title = date

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
        {
            text: `Move`,
            action: () => {
                App.move_to_color(e)
            }
        },
        {
            text: `Remove`,
            action: () => {
                App.remove_curl(e)
            }
        },
        {
            text: `To Top`,
            action: () => {
                App.curl_to_top(e)
            }
        },
        {
            text: `To Bottom`,
            action: () => {
                App.curl_to_bottom(e)
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
    let used = App.last_used_curls
    let items = App.last_items
    let curls = used.filter(curl => !items.find(item => item.curl === curl))
    let missing = []

    for (let curl of curls) {
        missing.push({curl: curl, status: `Not found`, updated: `0`})
    }

    return missing
}

App.change_date_mode = () => {
    App.date_mode = App.date_mode === `12` ? `24` : `12`
    localStorage.setItem(`date_mode`, App.date_mode)
    App.update(true)
}