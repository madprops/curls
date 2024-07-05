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
    App.remove_curl_item(curl)
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