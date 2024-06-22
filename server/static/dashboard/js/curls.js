App.start_update_timeout = () => {
    App.update_timeout = setTimeout(() => {
        App.update()
    }, App.update_delay)
}

App.update = (force = false, feedback = true) => {
    clearTimeout(App.update_timeout)

    if (force || App.updates_enabled) {
        App.update_curls(feedback)
    }

    App.start_update_timeout()
}

App.get_used_curls = () => {
    let curls = App.get_curls()

    if (!curls.length) {
        return []
    }

    let used_curls = []

    for (let curl of curls) {
        if (used_curls.length > App.max_curls) {
            break
        }

        curl = curl.trim()

        if (!curl) {
            continue
        }

        if (curl.includes(` `)) {
            continue
        }

        if (curl.length > App.curl_max_length) {
            continue
        }

        if (used_curls.includes(curl)) {
            continue
        }

        used_curls.push(curl)
    }

    return used_curls
}

App.update_curls = async (feedback = true) => {
    App.info(`Updating...`)
    let used_curls = App.get_used_curls()
    App.last_used_curls = used_curls

    if (!used_curls.length) {
        App.empty_container()
        return
    }

    let url = `/curls`
    let params = new URLSearchParams()

    for (let curl of used_curls) {
        params.append(`curl`, curl);
    }

    if (feedback) {
        App.show_updating()
    }

    let response = ``

    try {
        response = await fetch(url, {
            method: `POST`,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`
            },
            body: params,
        })
    }
    catch (e) {
        App.info(`Error: Failed to update`)
        App.clear_updating()
        return
    }

    try {
        let items = await response.json()
        App.insert_items(items)
    }
    catch (e) {
        App.info(`Error: Failed to parse response`)
    }

    App.clear_updating()
}

App.show_updating = () => {
    let button = DOM.el(`#update`)
    clearTimeout(App.clear_updating_timeout)
    button.classList.add(`active`)
}

App.clear_updating = () => {
    App.clear_updating_timeout = setTimeout(() => {
        let button = DOM.el(`#update`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.get_sort = () => {
    let sort = DOM.el(`#sort`)
    return sort.options[sort.selectedIndex].value
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

App.clear_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

App.empty_container = () => {
    let container = DOM.el(`#container`)
    let item = DOM.create(`div`, `info_item`)

    let lines = [
        `Add some curls to the list on the left.`,
        `These will be monitored for status changes.`,
        `Above you can change the status of your own curls.`,
        `Use the claim link on the top right to get a new curl.`,
    ]

    item.innerHTML = lines.join(`<br><br>`)
    container.innerHTML = ``
    container.append(item)
    App.unselect()
}

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

    for (let item of items) {
        App.insert_item(item)
    }

    let missing = App.get_missing()
    App.last_missing = missing

    for (let curl of missing) {
        App.insert_item({curl, status: `Not found`, updated: 0})
    }

    App.unselect()
    App.check_first_item()
}

App.get_curls = () => {
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)
    return lines
}

App.do_add_curl = (where, curl = ``, update = true) => {
    if (!curl) {
        curl = prompt(`Add a curl:`)

        if (!curl) {
            return
        }
    }

    let curlist = DOM.el(`#curlist`)

    if (where === `top`) {
        curlist.value = `${curl}\n${curlist.value}`
    }
    else if (where === `bottom`) {
        curlist.value += `\n${curl}`
    }

    App.clean_curlist()

    if (App.save_curlist()) {
        if (update) {
            App.update(true)
        }
    }
}

App.save_cleaned = (cleaned, removed) => {
    let s = App.plural(removed.length, `item`, `items`)

    if (confirm(`Remove ${removed.length} ${s}?`)) {
        curlist.value = cleaned.join(`\n`)
        App.clean_curlist()

        if (App.save_curlist()) {
            App.update(true)
        }
    }
}

App.get_item = (curl) => {
    return App.last_items.find(item => item.curl === curl)
}

App.add_owned_curl = (curl) => {
    let curls = App.get_curls()

    if (!curls.includes(curl)) {
        App.do_add_curl(`top`, curl)
    }
}

App.copy_item = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    let status = item.querySelector(`.item_status`).textContent
    let updated = item.querySelector(`.item_updated`).textContent
    let msg = `${curl}\n${status}\n${updated}`
    navigator.clipboard.writeText(msg)

    let icon = item.querySelector(`.item_icon`)
    icon.classList.add(`blink`)

    setTimeout(() => {
        icon.classList.remove(`blink`)
    }, 1000)
}

App.setup_container = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        let icon = e.target.closest(`.item_icon`)

        if (icon) {
            App.show_item_menu(e)
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        let icon = e.target.closest(`.item_icon`)

        if (icon) {
            e.preventDefault()
            App.show_item_menu(e)
        }
    })
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

App.curl_to_top = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`top`, curl, false)

    if (App.get_sort() === `order`) {
        App.update(true)
    }
}

App.curl_to_bottom = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`bottom`, curl, false)

    if (App.get_sort() === `order`) {
        App.update(true)
    }
}

App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    DOM.ev(sort, `change`, () => {
        App.change_sort()
    })

    let saved = localStorage.getItem(`sort`) || `recent`
    sort.value = saved
}

App.change_sort = () => {
    let mode = App.get_sort()
    localStorage.setItem(`sort`, mode)
    App.update(true)
}

App.get_missing = () => {
    let used = App.last_used_curls
    let items = App.last_items
    return used.filter(curl => !items.find(item => item.curl === curl))
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