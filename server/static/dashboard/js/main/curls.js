/*

These are curl operations

*/

const Curls = {
    max_curls: 100,
    max_length: 20,
}

Curls.add = (where) => {
    Windows.prompt({title: `Add Curls`, callback: (value) => {
        Curls.add_submit(where, value)
    }, message: `Enter one or more curls`})
}

Curls.add_submit = (where, curls) => {
    if (!curls) {
        return
    }

    let units = Utils.smart_list(curls)

    if (!units.length) {
        return
    }

    if (where === `top`) {
        units = units.reverse()
    }

    let added = []

    for (let curl of units) {
        if (Curls.do_add({where: where, curl: curl, update: false})) {
            added.push(curl)
        }
    }

    if (added.length) {
        Update.update({ curls: added, update_curlist: true })
    }
}

Curls.do_add = (args = {}) => {
    let def_args = {
        where: `top`,
        curl: ``,
        update: true,
        color: Colors.mode,
    }

    Utils.def_args(def_args, args)

    if (!Curlist.check(args.curl)) {
        return false
    }

    let curls = Curls.get(args.color)

    if (curls.length >= Curls.max_curls) {
        return false
    }

    curls = curls.filter(x => x !== args.curl)

    if (args.where === `top`) {
        curls.unshift(args.curl)
    }
    else if (args.where === `bottom`) {
        curls.push(args.curl)
    }

    Curls.save(curls)

    if (args.update) {
        Curlist.update()
    }

    return true
}

Curls.add_owned = (curl) => {
    let curls = Curls.get()

    if (!curls.includes(curl)) {
        Curls.do_add({curl: curl})
    }
}

Curls.to_top = (curls) => {
    let cleaned = [...curls]

    for (let curl of Curls.get()) {
        if (!cleaned.includes(curl)) {
            cleaned.push(curl)
        }
    }

    Curls.after_move(cleaned, curls, curls[0])
}

Curls.to_bottom = (curls) => {
    let cleaned = []

    for (let curl of Curls.get()) {
        if (!curls.includes(curl)) {
            cleaned.push(curl)
        }
    }

    cleaned.push(...curls)
    Curls.after_move(cleaned, curls, Utils.last(curls))
}

Curls.after_move = (new_curls, curls, leader) => {
    Curls.save(new_curls)
    Curlist.update()
    Sort.sort_if_order()
    Curlist.deselect()

    for (let curl of curls) {
        let el = Curlist.get_item(curl)

        if (el) {
            Curlist.do_select_item({item: el, block: `none`})
        }
    }

    Curlist.focus_item(leader)
}

Curls.save = (curls, color = Colors.mode) => {
    let name = Curls.get_name(color)
    Utils.save(name, JSON.stringify(curls))
}

Curls.get = (color = Colors.mode) => {
    let name = Curls.get_name(color)
    let saved = Utils.load_array(name)

    try {
        let curls = JSON.parse(saved)
        return Curls.clean(curls)
    }
    catch (err) {
        return []
    }
}

Curls.replace = () => {
    Windows.prompt({title: `Replace Curls`, callback: (value) => {
        Curls.replace_submit(value)
    }, message: `Replace the entire list with this`})
}

Curls.replace_submit = (curls) => {
    if (!curls) {
        return
    }

    let units = curls.split(` `).filter(x => x)

    if (!units.length) {
        return
    }

    units = units.reverse()
    Curls.clear()
    let added = false

    for (let curl of units) {
        if (Curls.do_add({curl: curl, update: false})) {
            added = true
        }
    }

    if (added) {
        Curlist.update()
        Update.update()
    }
}

Curls.clear = (color = Colors.mode) => {
    let name = Curls.get_name(color)
    Utils.save(name, ``)
}

Curls.edit = (curl) => {
    Windows.prompt({title: `Edit Curl`, callback: (value) => {
        Curls.edit_submit(curl, value)
    }, value: curl, message: `Change the name of this curl`})
}

Curls.edit_submit = (curl, new_curl) => {
    if (!new_curl) {
        return
    }

    Curls.do_edit(curl, new_curl)
}

Curls.do_edit = (curl, new_curl) => {
    if (!Curlist.check(new_curl)) {
        return
    }

    if (curl === new_curl) {
        return
    }

    let curls = Curls.get()
    let index = curls.indexOf(curl)

    if (index === -1) {
        return
    }

    curls[index] = new_curl
    Curls.save(curls)
    Curlist.update()
    Items.remove_curl(curl)
    Update.update({ curls: [new_curl] })
}

Curlist.check = (curl) => {
    if (!curl) {
        return false
    }

    if (curl.length > Curls.max_length) {
        return false
    }

    if (!/^[a-zA-Z0-9]+$/.test(curl)) {
        return false
    }

    return true
}

Curls.clean = (curls) => {
    let cleaned = []

    for (let curl of curls) {
        if (!Curlist.check(curl)) {
            continue
        }

        cleaned.push(curl)

        if (cleaned.length >= Curls.max_curls) {
            break
        }
    }

    return cleaned
}

Curls.get_name = (color) => {
    return `curls_${color}`
}

Curls.clear_all = () => {
    Windows.confirm({title: `Clear Curls`, ok: () => {
        for (let color in App.colors) {
            Curls.clear(color)
        }

        Curlist.update()
        Container.empty()
    }, message: `Remove all curls in all colors`})
}

Curls.remove = (curls) => {
    let cleaned = []
    let removed = []

    for (let curl of Curls.get()) {
        if (!curls.includes(curl)) {
            cleaned.push(curl)
        }
        else {
            removed.push(curl)
        }
    }

    if (!removed.length) {
        return
    }

    Curls.save_cleaned(cleaned, removed)
}

Curls.remove_selected = () => {
    let curls = Curlist.get_selected_curls()
    Curls.remove(curls)
}

Curls.remove_all = () => {
    Windows.confirm({title: `Remove All Curls`, ok: () => {
        Curls.clear()
        Curlist.update()
        Container.empty()
        Peek.hide()
    }, message: `Remove all curls in the current color`})
}

Curls.show_remove_menu = (e) => {
    let items = [
        {
            text: `Remove One`,
            action: () => {
                Curls.remove_one()
            }
        },
        {
            text: `Remove Not Found`,
            action: () => {
                Curls.remove_not_found()
            }
        },
        {
            text: `Remove Empty`,
            action: () => {
                Curls.remove_empty()
            }
        },
        {
            text: `Remove Old`,
            action: () => {
                Curls.remove_old()
            }
        },
        {
            text: `Remove All`,
            action: () => {
                Curls.remove_all()
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

Curls.remove_one = () => {
    Windows.prompt({title: `Remove Curl`, callback: (value) => {
        Curls.remove_one_submit(value)
    }, message: `Enter the curl to remove`})
}

Curls.remove_one_submit = (curl) => {
    if (!curl) {
        return
    }

    Curls.do_remove(curl)
}

Curls.do_remove = (curl, remove_item = true) => {
    let curls = Curls.get()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    Curls.save(cleaned)
    Curlist.update()

    if (remove_item) {
        Items.remove([curl])
    }

    if (Peek.curl === curl) {
        Peek.hide()
    }
}

Curls.remove_not_found = () => {
    let missing = Items.get_missing().map(x => x.curl)
    let curls = Curls.get()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        if (!missing.includes(curl)) {
            cleaned.push(curl)
        }
        else {
            removed.push(curl)
        }
    }

    if (!removed.length) {
        return
    }

    Curls.save_cleaned(cleaned, removed)
}

Curls.remove_empty = () => {
    let curls = Curls.get()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = Items.get(curl)

        if (!item) {
            continue
        }

        if (!item.status) {
            removed.push(curl)
            continue
        }

        cleaned.push(curl)
    }

    if (!removed.length) {
        return
    }

    Curls.save_cleaned(cleaned, removed)
}

Curls.remove_old = () => {
    let curls = Curls.get()
    let now = Utils.now()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = Items.get(curl)

        if (!item) {
            continue
        }

        let date = item.updated

        if (date) {
            let datetime = new Date(date + `Z`).getTime()

            if ((now - datetime) > (App.old_delay)) {
                removed.push(curl)
                continue
            }
        }

        cleaned.push(curl)
    }

    if (!removed.length) {
        return
    }

    Curls.save_cleaned(cleaned, removed)
}

Curls.save_cleaned = (cleaned, removed) => {
    let s = Utils.plural(removed.length, `Curl`, `Curls`)
    let curls = removed.join(`, `)

    Windows.confirm({title: `Remove ${removed.length} ${s}`, ok: () => {
        Curls.save(cleaned)
        Curlist.update()
        Items.remove(removed)
        Peek.hide()
    }, message: curls})
}