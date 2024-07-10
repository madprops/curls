/*

This sorts the container

*/

class Sort {
    static default_mode = `newest`
    static ls_name = `sort`

    static modes = [
        {value: `order`, name: `Order`, info: `Keep the order of dragged items`},
        {value: App.separator},
        {value: `newest`, name: `Newest`, info: `Sort by status change date, newest first`},
        {value: `oldest`, name: `Oldest`, info: `Sort by status change date, oldest first`},
        {value: App.separator},
        {value: `recent`, name: `Recent`, info: `Sort by the date when the curl was added, newest first`},
        {value: `classic`, name: `Classic`, info: `Sort by the date when the curl was added, oldest first`},
        {value: App.separator},
        {value: `curls`, name: `Curls`, info: `Sort curls alphabetically in ascending order`},
        {value: `status`, name: `Status`, info: `Sort status alphabetically in ascending order`},
        {value: App.separator},
        {value: `active`, name: `Active`, info: `Sort by the number of changes`},
    ]

    static setup() {
        let sort = DOM.el(`#sort`)
        this.mode = this.load_sort()

        this.combo = new Combo({
            title: `Sort Modes`,
            items: this.modes,
            value: this.mode,
            element: sort,
            default: this.default_mode,
            action: (value) => {
                this.change(value)
            },
            get: () => {
                return this.mode
            },
        })
    }

    static set_value(value) {
        if (this.mode === value) {
            return
        }

        this.combo.set_value(value)
    }

    static change(value) {
        if (this.mode === value) {
            return
        }

        this.mode = value
        Utils.save(this.ls_name, value)

        if (this.mode === `order`) {
            Container.save_curls()
        }
        else {
            Container.update()
        }
    }

    static sort_if_order() {
        if (this.mode == `order`) {
            Container.update()
        }
    }

    static sort(items) {
        let mode = this.mode

        if (mode === `order`) {
            let curls = Curls.get_curls()

            items.sort((a, b) => {
                let a_index = curls.indexOf(a.curl)
                let b_index = curls.indexOf(b.curl)
                return a_index - b_index
            })
        }
        else if (mode === `newest`) {
            items.sort((a, b) => {
                let compare = b.updated.localeCompare(a.updated)
                return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `oldest`) {
            items.sort((a, b) => {
                let compare = a.updated.localeCompare(b.updated)
                return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `curls`) {
            items.sort((a, b) => {
                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `status`) {
            items.sort((a, b) => {
                let compare = a.status.localeCompare(b.status)
                return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `recent`) {
            let items_ = Curls.get()

            items.sort((a, b) => {
                let item_a = Utils.find_item(items_, `curl`, a.curl)
                let item_b = Utils.find_item(items_, `curl`, b.curl)
                let diff = item_b.added - item_a.added

                if (diff !== 0) {
                    return diff
                }

                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `classic`) {
            let items_ = Curls.get()

            items.sort((a, b) => {
                let item_a = Utils.find_item(items_, `curl`, a.curl)
                let item_b = Utils.find_item(items_, `curl`, b.curl)
                let diff = item_a.added - item_b.added

                if (diff !== 0) {
                    return diff
                }

                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `active`) {
            items.sort((a, b) => {
                let compare = b.changes - a.changes
                return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
            })
        }
    }

    static load_sort() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }
}