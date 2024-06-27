App.get_used_curls = () => {
    let curls = App.get_curlist()

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

App.do_add_curl = (where, curl = ``, update = true) => {
    if (!curl) {
        curl = prompt(`Add a curl:`)

        if (!curl) {
            return
        }
    }

    let curls = App.get_curls_by_color()

    if (where === `top`) {
        curls.unshift(curl)
    }
    else if (where === `bottom`) {
        curls.push(curl)
    }

    if (App.save_curls(App.color_mode, curls)) {
        App.refresh_curlist()

        if (update) {
            App.update(true)
        }
    }
}

App.add_owned_curl = (curl) => {
    let curls = App.get_curlist()

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

App.curl_to_top = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`top`, curl, false)
    App.sort_if_order()
}

App.curl_to_bottom = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`bottom`, curl, false)
    App.sort_if_order()
}

App.save_curls = (color, curls) => {
    if (!color) {
        color = App.color_mode
    }

    if (!curls) {
        curls = App.get_curlist()
    }

    let saved = App.get_curls_by_color(color)

    if (App.same_list(curls, saved)) {
        return false
    }

    let name = App.get_curls_name(color)
    localStorage.setItem(name, JSON.stringify(curls))
    return true
}

App.get_curls_by_color = (color = App.color_mode) => {
    let name = App.get_curls_name(color)
    let saved = localStorage.getItem(name) || `[]`

    try {
        return JSON.parse(saved)
    }
    catch (err) {
        return []
    }
}