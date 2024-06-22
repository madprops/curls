App.insert_items = (items) => {
    App.clear_container()
    App.sort_items(items)
    App.last_items = items

    for (let item of items) {
        item.original_status = item.status

        if (!item.status) {
            item.status = `Not updated yet`
        }
    }

    let inserted = false

    for (let item of items) {
        App.insert_item(item)
        inserted = true
    }

    let missing = App.get_missing()
    App.last_missing = missing

    for (let curl of missing) {
        App.insert_item({curl, status: `Not found`, updated: 0})
        inserted = true
    }

    App.unselect()

    if (inserted) {
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
    item_status.innerHTML = App.sanitize(item.status)
    App.urlize(item_status)

    let date = new Date(item.updated + "Z")
    let s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
    item_updated.textContent = s_date
    item_updated.title = date

    el.append(item_icon)
    el.append(item_curl)
    el.append(item_status)
    el.append(item_updated)

    container.append(el)
    container.append(el)
}

App.get_last_item = (curl) => {
    return App.last_items.find(item => item.curl === curl)
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

App.sort_items = (items) => {
    let mode = App.get_sort()

    if (mode === `recent`) {
        items.sort((a, b) => {
            return b.updated.localeCompare(a.updated)
        })
    }
    else if (mode === `order`) {
        let used_curls = App.last_used_curls

        items.sort((a, b) => {
            return used_curls.indexOf(a.curl) - used_curls.indexOf(b.curl)
        })
    }
    else if (mode === `alpha`) {
        items.sort((a, b) => {
            return a.curl.localeCompare(b.curl)
        })
    }
}

App.remove_item = (curl) => {
    let item = App.get_item(curl)

    if (item) {
        item.remove()
    }
}

App.item_to_top = (curl) => {
    let item = App.get_item(curl)

    if (item) {
        let container = DOM.el(`#container`)
        container.prepend(item)
    }
}

App.item_to_bottom = (curl) => {
    let item = App.get_item(curl)

    if (item) {
        let container = DOM.el(`#container`)
        container.append(item)
    }
}

App.get_item = (curl) => {
    let els = DOM.els(`#container .item`)

    for (let el of els) {
        let values = App.get_item_values(el)
        let curl_ = values.curl

        if (curl === curl_) {
            return el
        }
    }
}

App.get_item_values = (el) => {
    let curl = DOM.el(`.item_curl`, el).innerText
    let status = DOM.el(`.item_status`, el).innerText
    let updated = DOM.el(`.item_updated`, el).innerText
    return {curl, status, updated}
}