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
    App.prompt(`Add one or more curls`, (value) => {
        App.add_curl_submit(where, value)
    })
}

App.add_curl_submit = (where, curls) => {
    if (!curls) {
        return
    }

    let words = App.smart_list(curls)

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

App.curl_to_top = (curl) => {
    let curls = App.get_curls()
    curls = curls.filter(x => x !== curl)
    curls.unshift(curl)
    App.save_curls(curls)
    App.update_curlist()
    App.sort_if_order()
    App.focus_curl(curl)
}

App.curl_to_bottom = (curl) => {
    let curls = App.get_curls()
    curls = curls.filter(x => x !== curl)
    curls.push(curl)
    App.save_curls(curls)
    App.update_curlist()
    App.sort_if_order()
    App.focus_curl(curl)
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
    App.prompt(`This will replace the entire list`, (value) => {
        App.replace_curls_submit(value)
    })
}

App.replace_curls_submit = (curls) => {
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
    App.prompt(`Edit this curl`, (value) => {
        App.edit_curl_submit(curl, value)
    }, curl)
}

App.edit_curl_submit = (curl, new_curl) => {
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

App.focus_curl = (curl) => {
    let item = App.get_item(curl)

    if (!item || !item.element) {
        return
    }

    item.element.scrollIntoView({behavior: `smooth`, block: `center`})
}