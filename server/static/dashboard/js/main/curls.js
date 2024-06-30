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
    App.prompt({title: `Add one or more curls`, callback: (value) => {
        App.add_curl_submit(where, value)
    }})
}

App.add_curl_submit = (where, curls) => {
    if (!curls) {
        return
    }

    let units = App.smart_list(curls)

    if (!units.length) {
        return
    }

    if (where === `top`) {
        units = units.reverse()
    }

    let added = []

    for (let curl of units) {
        if (App.do_add_curl({where: where, curl: curl, update: false})) {
            added.push(curl)
        }
    }

    if (added.length) {
        App.update_curlist()
        App.update({ curls: added })
    }
}

App.do_add_curl = (args = {}) => {
    let def_args = {
        where: `top`,
        curl: ``,
        update: true,
    }

    App.def_args(def_args, args)

    if (!App.check_curl(args.curl)) {
        return false
    }

    let curls = App.get_curls()
    curls = curls.filter(x => x !== args.curl)

    if (args.where === `top`) {
        curls.unshift(args.curl)
    }
    else if (args.where === `bottom`) {
        curls.push(args.curl)
    }

    App.save_curls(curls)

    if (args.update) {
        App.update_curlist()
    }

    return true
}

App.add_owned_curl = (curl) => {
    let curls = App.get_curls()

    if (!curls.includes(curl)) {
        App.do_add_curl({curl: curl})
    }
}

App.curls_to_top = (curls) => {
    let cleaned = curls

    for (let curl of App.get_curls()) {
        if (!cleaned.includes(curl)) {
            cleaned.push(curl)
        }
    }

    App.after_curls_move(cleaned, curls[0])
}

App.curls_to_bottom = (curls) => {
    let cleaned = []

    for (let curl of App.get_curls()) {
        if (!curls.includes(curl)) {
            cleaned.push(curl)
        }
    }

    cleaned.push(...curls)
    App.after_curls_move(cleaned, curls.slice(-1)[0])
}

App.after_curls_move = (curls, leader) => {
    App.save_curls(curls)
    App.update_curlist()
    App.sort_if_order()
    App.focus_curl(leader)
    App.focus_curlist_item(leader)
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
    App.prompt({title: `This will replace the entire list`, callback: (value) => {
        App.replace_curls_submit(value)
    }})
}

App.replace_curls_submit = (curls) => {
    if (!curls) {
        return
    }

    let units = curls.split(` `).filter(x => x)

    if (!units.length) {
        return
    }

    units = units.reverse()
    App.clear_curls()
    let added = false

    for (let curl of units) {
        if (App.do_add_curl({curl: curl, update: false})) {
            added = true
        }
    }

    if (added) {
        App.update_curlist()
        App.update()
    }
}

App.clear_curls = (color = App.color_mode) => {
    let name = App.get_curls_name(color)
    localStorage.setItem(name, ``)
}

App.edit_curl = (curl) => {
    App.prompt({title: `Edit this curl`, callback: (value) => {
        App.edit_curl_submit(curl, value)
    }, value: curl})
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
    App.remove_curl_item(curl)
    App.update({ curls: [new_curl] })
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

    item.element.scrollIntoView({ behavior: `smooth`, block: `center` })
}