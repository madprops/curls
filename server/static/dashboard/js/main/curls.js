/*

These are curl operations

*/

class CurlsClass {
    constructor() {
        this.max_curls = 100
        this.max_length = 20
    }

    add(where) {
        Windows.prompt({title: `Add Curls`, callback: (value) => {
            this.add_submit(where, value)
        }, message: `Enter one or more curls`})
    }

    add_submit(where, curls) {
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
            if (this.do_add({where: where, curl: curl, update: false})) {
                added.push(curl)
            }
        }

        if (added.length) {
            Update.update({ curls: added, update_curlist: true })
        }
    }

    do_add(args = {}) {
        let def_args = {
            where: `top`,
            curl: ``,
            update: true,
            color: Colors.mode,
        }

        Utils.def_args(def_args, args)

        if (!this.check(args.curl)) {
            return false
        }

        let curls = this.get(args.color)

        if (curls.length >= this.max_curls) {
            return false
        }

        curls = curls.filter(x => x !== args.curl)

        if (args.where === `top`) {
            curls.unshift(args.curl)
        }
        else if (args.where === `bottom`) {
            curls.push(args.curl)
        }

        this.save(curls)

        if (args.update) {
            Curlist.update()
        }

        return true
    }

    add_owned(curl) {
        let curls = this.get()

        if (!curls.includes(curl)) {
            this.do_add({curl: curl})
        }
    }

    to_top(curls) {
        let cleaned = [...curls]

        for (let curl of this.get()) {
            if (!cleaned.includes(curl)) {
                cleaned.push(curl)
            }
        }

        this.after_move(cleaned, curls, curls[0])
    }

    to_bottom(curls) {
        let cleaned = []

        for (let curl of this.get()) {
            if (!curls.includes(curl)) {
                cleaned.push(curl)
            }
        }

        cleaned.push(...curls)
        this.after_move(cleaned, curls, Utils.last(curls))
    }

    after_move(new_curls, curls, leader) {
        this.save(new_curls)
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

    save(curls, color = Colors.mode) {
        let name = this.get_name(color)
        Utils.save(name, JSON.stringify(curls))
    }

    get(color = Colors.mode) {
        let name = this.get_name(color)
        let saved = Utils.load_array(name)

        try {
            let curls = JSON.parse(saved)
            return this.clean(curls)
        }
        catch (err) {
            return []
        }
    }

    replace() {
        Windows.prompt({title: `Replace Curls`, callback: (value) => {
            this.replace_submit(value)
        }, message: `Replace the entire list with this`})
    }

    replace_submit(curls) {
        if (!curls) {
            return
        }

        let units = curls.split(` `).filter(x => x)

        if (!units.length) {
            return
        }

        units = units.reverse()
        this.clear()
        let added = false

        for (let curl of units) {
            if (this.do_add({curl: curl, update: false})) {
                added = true
            }
        }

        if (added) {
            Curlist.update()
            Update.update()
        }
    }

    clear(color = Colors.mode) {
        let name = this.get_name(color)
        Utils.save(name, ``)
    }

    edit(curl) {
        Windows.prompt({title: `Edit Curl`, callback: (value) => {
            this.edit_submit(curl, value)
        }, value: curl, message: `Change the name of this curl`})
    }

    edit_submit(curl, new_curl) {
        if (!new_curl) {
            return
        }

        this.do_edit(curl, new_curl)
    }

    do_edit(curl, new_curl) {
        if (!this.check(new_curl)) {
            return
        }

        if (curl === new_curl) {
            return
        }

        let curls = this.get()
        let index = curls.indexOf(curl)

        if (index === -1) {
            return
        }

        curls[index] = new_curl
        this.save(curls)
        Curlist.update()
        Items.remove_curl(curl)
        Update.update({ curls: [new_curl] })
    }

    check = (curl) => {
        if (!curl) {
            return false
        }

        if (curl.length > this.max_length) {
            return false
        }

        if (!/^[a-zA-Z0-9]+$/.test(curl)) {
            return false
        }

        return true
    }

    clean(curls) {
        let cleaned = []

        for (let curl of curls) {
            if (!this.check(curl)) {
                continue
            }

            cleaned.push(curl)

            if (cleaned.length >= this.max_curls) {
                break
            }
        }

        return cleaned
    }

    get_name(color) {
        return `curls_${color}`
    }

    clear_all() {
        Windows.confirm({title: `Clear Curls`, ok: () => {
            for (let color in App.colors) {
                this.clear(color)
            }

            Curlist.update()
            Container.empty()
        }, message: `Remove all curls in all colors`})
    }

    remove(curls) {
        let cleaned = []
        let removed = []

        for (let curl of this.get()) {
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

        this.save_cleaned(cleaned, removed)
    }

    remove_selected() {
        let curls = Curlist.get_selected_curls()
        this.remove(curls)
    }

    remove_all() {
        Windows.confirm({title: `Remove All Curls`, ok: () => {
            this.clear()
            Curlist.update()
            Container.empty()
            Peek.hide()
        }, message: `Remove all curls in the current color`})
    }

    show_remove_menu(e) {
        let items = [
            {
                text: `Remove One`,
                action: () => {
                    this.remove_one()
                }
            },
            {
                text: `Remove Not Found`,
                action: () => {
                    this.remove_not_found()
                }
            },
            {
                text: `Remove Empty`,
                action: () => {
                    this.remove_empty()
                }
            },
            {
                text: `Remove Old`,
                action: () => {
                    this.remove_old()
                }
            },
            {
                text: `Remove All`,
                action: () => {
                    this.remove_all()
                }
            },
        ]

        NeedContext.show({items: items, e: e})
    }

    remove_one() {
        Windows.prompt({title: `Remove Curl`, callback: (value) => {
            this.remove_one_submit(value)
        }, message: `Enter the curl to remove`})
    }

    remove_one_submit(curl) {
        if (!curl) {
            return
        }

        this.do_remove(curl)
    }

    do_remove(curl, remove_item = true) {
        let curls = this.get()
        let cleaned = []

        for (let curl_ of curls) {
            if (curl !== curl_) {
                cleaned.push(curl_)
            }
        }

        this.save(cleaned)
        Curlist.update()

        if (remove_item) {
            Items.remove([curl])
        }

        if (Peek.curl === curl) {
            Peek.hide()
        }
    }

    remove_not_found() {
        let missing = Items.get_missing().map(x => x.curl)
        let curls = this.get()
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

        this.save_cleaned(cleaned, removed)
    }

    remove_empty() {
        let curls = this.get()
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

        this.save_cleaned(cleaned, removed)
    }

    remove_old() {
        let curls = this.get()
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

        this.save_cleaned(cleaned, removed)
    }

    save_cleaned(cleaned, removed) {
        let s = Utils.plural(removed.length, `Curl`, `Curls`)
        let curls = removed.join(`, `)

        Windows.confirm({title: `Remove ${removed.length} ${s}`, ok: () => {
            this.save(cleaned)
            Curlist.update()
            Items.remove(removed)
            Peek.hide()
        }, message: curls})
    }
}

const Curls = new CurlsClass()