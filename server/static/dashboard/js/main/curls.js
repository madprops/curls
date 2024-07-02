App.add_curls = (where) => {
    App.prompt({title: `Add Curls`, callback: (value) => {
        App.add_curls_submit(where, value)
    }, message: `Enter one or more curls`})
}

App.add_curls_submit = (where, curls) => {
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

    if (curls.length >= App.max_curls) {
        return false
    }

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
    let cleaned = [...curls]

    for (let curl of App.get_curls()) {
        if (!cleaned.includes(curl)) {
            cleaned.push(curl)
        }
    }

    App.after_curls_move(cleaned, curls, curls[0])
}

App.curls_to_bottom = (curls) => {
    let cleaned = []

    for (let curl of App.get_curls()) {
        if (!curls.includes(curl)) {
            cleaned.push(curl)
        }
    }

    cleaned.push(...curls)
    App.after_curls_move(cleaned, curls, curls.slice(-1)[0])
}

App.after_curls_move = (new_curls, curls, leader) => {
    App.save_curls(new_curls)
    App.update_curlist()
    App.sort_if_order()
    App.unselect_curlist()

    for (let curl of curls) {
        let el = App.get_curlist_item(curl)

        if (el) {
            App.do_select_curlist_item({item: el, block: `none`})
        }
    }

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
        let curls = JSON.parse(saved)
        return App.clean_curls(curls)
    }
    catch (err) {
        return []
    }
}

App.replace_curls = () => {
    App.prompt({title: `Replace Curls`, callback: (value) => {
        App.replace_curls_submit(value)
    }, message: `This will replace the entire list`})
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
    App.prompt({title: `Edit Curl`, callback: (value) => {
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

App.clean_curls = (curls) => {
    let cleaned = []

    for (let curl of curls) {
        if (!App.check_curl(curl)) {
            continue
        }

        cleaned.push(curl)

        if (cleaned.length >= App.max_curls) {
            break
        }
    }

    return cleaned
}