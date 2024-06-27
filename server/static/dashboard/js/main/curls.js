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

App.add_curl = (where) => {
    let curls = prompt(`Add curls. Separated by spaces`)

    if (!curls) {
        return
    }

    let words = curls.split(` `).filter(x => x)

    if (!words.length) {
        return
    }

    if (where === `top`) {
        words = words.reverse()
    }

    let added = false

    for (let curl of words) {
        if (App.do_add_curl(where, curl, false)) {
            added = true
        }
    }

    if (added) {
        App.update_curlist()
        App.update(true)
    }
}

App.do_add_curl = (where, curl = ``, update = true) => {
    if (!App.check_curl(curl)) {
        return false
    }

    let curls = App.get_curls()
    curls = curls.filter(x => x !== curl)

    if (where === `top`) {
        curls.unshift(curl)
    }
    else if (where === `bottom`) {
        curls.push(curl)
    }

    App.save_curls(curls)

    if (update) {
        App.update_curlist()
    }

    return true
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
    App.do_copy_item(curl, status, updated)
}

App.do_copy_item = (curl, status, updated) => {
    let msg = `${curl}\n${status}\n${updated}`
    navigator.clipboard.writeText(msg)

    let icon = item.querySelector(`.item_icon`)
    icon.classList.add(`blink`)

    setTimeout(() => {
        icon.classList.remove(`blink`)
    }, 1000)
}

App.curl_to_top = (curl) => {
    let curls = App.get_curls()
    curls = curls.filter(x => x !== curl)
    curls.unshift(curl)
    App.save_curls(curls)
    App.update_curlist()
    App.sort_if_order()
}

App.curl_to_bottom = (curl) => {
    let curls = App.get_curls()
    curls = curls.filter(x => x !== curl)
    curls.push(curl)
    App.save_curls(curls)
    App.update_curlist()
    App.sort_if_order()
}

App.save_curls = (curls, color = App.color_mode) => {
    let name = App.get_curls_name(color)
    localStorage.setItem(name, JSON.stringify(curls))
}

App.get_curls = (color = App.color_mode) => {
    let name = App.get_curls_name(color)
    let saved = localStorage.getItem(name) || `[]`

    try {
        return JSON.parse(saved)
    }
    catch (err) {
        return []
    }
}

App.replace_curls = () => {
    let curls = prompt(`Enter the new curls. This will replace the entire list`)

    if (!curls) {
        return
    }

    let words = curls.split(` `).filter(x => x)

    if (!words.length) {
        return
    }

    words = words.reverse()
    App.clear_curls()
    let added = false

    for (let curl of words) {
        if (App.do_add_curl(`top`, curl, false)) {
            added = true
        }
    }

    if (added) {
        App.update_curlist()
        App.update(true)
    }
}

App.clear_curls = (color = App.color_mode) => {
    let name = App.get_curls_name(color)
    localStorage.setItem(name, ``)
}

App.edit_curl = (curl) => {
    let new_curl = prompt(`Edit the curl`, curl)

    if (!new_curl) {
        return
    }

    App.do_edit_curl(curl, new_curl)
}

App.do_edit_curl = (curl, new_curl) => {
    if (!App.check_curl(new_curl)) {
        return
    }

    let curls = App.get_curls()
    let index = curls.indexOf(curl)

    if (index === -1) {
        return
    }

    curls[index] = new_curl
    App.save_curls(curls)
    App.update_curlist()
    App.update(true)
}

App.check_curl = (curl) => {
    if (!curl) {
        return false
    }

    if (curl.length > App.curl_max_length) {
        return false
    }

    if (!/^[a-zA-Z0-9]+$/.test(curl)) {
        return false
    }

    return true
}

App.copy_curl = (curl) => {
    navigator.clipboard.writeText(curl)
}

App.peek_curl = (curl) => {
    let peek = DOM.el(`#peek`)
    let item = App.get_item(curl)
    peek.innerHTML = ``
    let el = DOM.create(`div`)
    let icon = DOM.create(`div`, `peek_icon`)
    let canvas = DOM.create(`canvas`, `peek_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    icon.append(canvas)
    let curl_ = DOM.create(`div`, `peek_curl`)
    curl_.textContent = item.curl
    let status = DOM.create(`div`, `peek_status`)
    status.innerHTML = App.sanitize(item.status)

    DOM.ev(icon, `click`, () => {
        App.do_copy_item(item.curl, item.status, item.updated_text)
    })

    el.append(icon)
    el.append(curl_)
    el.append(status)
    peek.append(el)

    peek.classList.add(`active`)
}

App.hide_peek = () => {
    DOM.el(`#peek`).classList.remove(`active`)
}