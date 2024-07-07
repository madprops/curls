/*

These are curl operations

*/

class Curls {
    static max_curls = 100
    static max_length = 20
    static old_delay = Utils.YEAR * 1
    static colors = {}

    static setup() {
        for (let color in Colors.colors) {
            this.colors[color] = this.load_curls(color)
        }
    }

    static add() {
        Windows.prompt({title: `Add Curls`, callback: (value) => {
            this.add_submit(value)
        }, message: `Enter one or more curls`})
    }

    static add_submit(curls) {
        if (!curls) {
            return
        }

        let added = Utils.smart_list(curls)

        if (!added.length) {
            return
        }

        this.prepend(added)
    }

    static prepend(added) {
        added = added.filter(x => this.check(x))

        if (!added.length) {
            return
        }

        let new_curls = Array.from(new Set([...added, ...this.get()]))

        if (this.save(new_curls)) {
            added.reverse()
            Update.update({ curls: added })
        }
    }

    static add_owned(curl) {
        let curls = this.get()

        if (curls.includes(curl)) {
            return
        }

        this.prepend([curl])
    }

    static to_top(curls) {
        let cleaned = [...curls]

        for (let curl of this.get()) {
            if (!cleaned.includes(curl)) {
                cleaned.push(curl)
            }
        }

        this.after_move(cleaned, curls)
    }

    static to_bottom(curls) {
        let cleaned = []

        for (let curl of this.get()) {
            if (!curls.includes(curl)) {
                cleaned.push(curl)
            }
        }

        cleaned.push(...curls)
        this.after_move(cleaned, curls)
    }

    static after_move(new_curls, curls) {
        this.save(new_curls)
        Sort.set_value(`order`)
        Sort.sort_if_order()
        Select.deselect_all()

        for (let curl of curls) {
            Select.curl(curl)
        }
    }

    static save(curls, color = Colors.mode) {
        curls = this.clean(curls)
        let same = true
        let current = this.get(color)

        if (current.length !== curls.length) {
            same = false
        }

        for (let i = 0; i < current.length; i++) {
            if (current[i] !== curls[i]) {
                same = false
                break
            }
        }

        if (same) {
            return false
        }

        let name = this.get_name(color)
        this.colors[color] = [...curls]
        Utils.save(name, JSON.stringify(curls))
        return true
    }

    static get(color = Colors.mode) {
        return this.colors[color]
    }

    static load_curls(color = Colors.mode) {
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

    static replace() {
        Windows.prompt({title: `Replace Curls`, callback: (value) => {
            this.replace_submit(value)
        }, message: `Replace the entire list with this`})
    }

    static replace_submit(curls) {
        if (!curls) {
            return
        }

        let units = curls.split(` `).filter(x => x)

        if (!units.length) {
            return
        }

        this.clear()
        let added = []

        for (let curl of units) {
            if (this.check(curl)) {
                added.push(curl)
            }
        }

        if (added) {
            if (this.save(added)) {
                Update.update()
            }
        }
    }

    static clear(color = Colors.mode) {
        let name = this.get_name(color)
        Utils.save(name, ``)
    }

    static edit(curl) {
        Windows.prompt({title: `Edit Curl`, callback: (value) => {
            this.edit_submit(curl, value)
        }, value: curl, message: `Change the name of this curl`})
    }

    static edit_submit(curl, new_curl) {
        if (!new_curl) {
            return
        }

        this.do_edit(curl, new_curl)
    }

    static do_edit(curl, new_curl) {
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

        if (this.save(curls)) {
            Items.remove_curl(curl)
            Update.update({ curls: [new_curl] })
        }
    }

    static check(curl) {
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

    static clean(curls) {
        let cleaned = []

        for (let curl of curls) {
            if (cleaned.includes(curl)) {
                continue
            }

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

    static get_name(color) {
        return `curls_${color}`
    }

    static clear_all() {
        Windows.confirm({title: `Clear Curls`, ok: () => {
            for (let color in Colors.colors) {
                this.clear(color)
            }

            Container.empty()
        }, message: `Remove all curls in all colors`})
    }

    static remove(curls) {
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

    static remove_selected(curl = ``) {
        let curls = Select.get_curls()

        if (curl) {
            if (!curls.includes(curl)) {
                curls = [curl]
            }
        }

        this.remove(curls)
    }

    static remove_all() {
        Windows.confirm({title: `Remove All Curls`, ok: () => {
            this.clear()
            Container.empty()
        }, message: `Remove all curls in the current color`})
    }

    static show_remove_menu(e) {
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

        Utils.context({items: items, e: e})
    }

    static remove_one() {
        Windows.prompt({title: `Remove Curl`, callback: (value) => {
            this.remove_one_submit(value)
        }, message: `Enter the curl to remove`})
    }

    static remove_one_submit(curl) {
        if (!curl) {
            return
        }

        this.do_remove(curl)
    }

    static do_remove(curl, remove_item = true) {
        let curls = this.get()
        let cleaned = []

        for (let curl_ of curls) {
            if (curl !== curl_) {
                cleaned.push(curl_)
            }
        }

        this.save(cleaned)

        if (remove_item) {
            Items.remove([curl])
        }
    }

    static remove_not_found() {
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

    static remove_empty() {
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

    static remove_old() {
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

                if ((now - datetime) > (this.old_delay)) {
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

    static save_cleaned(cleaned, removed) {
        let s = Utils.plural(removed.length, `Curl`, `Curls`)
        let curls = removed.join(`, `)

        Windows.confirm({title: `Remove ${removed.length} ${s}`, ok: () => {
            this.save(cleaned)
            Items.remove(removed)
        }, message: curls})
    }

    static copy() {
        let curls = this.get()
        let text = curls.join(` `)
        Utils.copy_to_clipboard(text)
    }
}