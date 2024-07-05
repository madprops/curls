/*

This sorts the container

*/

class SortClass {
    constructor() {
        this.default_mode = `newest`
        this.ls_name = `sort`

        this.modes = [
            {value: `order`, name: `Order`, info: `Use the same order as the curlist`},
            {value: App.separator},
            {value: `newest`, name: `Newest`, info: `Most recently changed at the top`},
            {value: `oldest`, name: `Oldest`, info: `Oldest ones at the top`},
            {value: App.separator},
            {value: `curl_asc`, name: `Curl Asc`, info: `Sort curls alphabetically in ascending order`},
            {value: `curl_desc`, name: `Curl Desc`, info: `Sort curls alphabetically in descending order`},
            {value: App.separator},
            {value: `status_asc`, name: `Status Asc`, info: `Sort status alphabetically in ascending order`},
            {value: `status_desc`, name: `Status Desc`, info: `Sort status alphabetically in descending order`},
            {value: App.separator},
            {value: `curl_short`, name: `Curl Short`, info: `Sort by the length of the curl in ascending order`},
            {value: `curl_long`, name: `Curl Long`, info: `Sort by the length of the curl in descending order`},
            {value: App.separator},
            {value: `status_short`, name: `Status Short`, info: `Sort by the length of the status in ascending order`},
            {value: `status_long`, name: `Status Long`, info: `Sort by the length of the status in descending order`},
        ]
    }

    setup() {
        let sort = DOM.el(`#sort`)
        this.mode = this.load_sort()

        Combo.register({
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

    change(value) {
        if (this.mode === value) {
            return
        }

        this.mode = value
        Utils.save(this.ls_name, value)
        Container.update()
    }

    sort_if_order() {
        if (this.mode == `order`) {
            Container.update()
        }
    }

    sort(items) {
        let mode = this.mode

        if (mode === `order`) {
            let curls = Curls.get()

            items.sort((a, b) => {
                return curls.indexOf(a.curl) - curls.indexOf(b.curl)
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
        else if (mode === `curl_asc`) {
            items.sort((a, b) => {
                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `curl_desc`) {
            items.sort((a, b) => {
                return b.curl.localeCompare(a.curl)
            })
        }
        else if (mode === `status_asc`) {
            items.sort((a, b) => {
                let compare = a.status.localeCompare(b.status)
                return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `status_desc`) {
            items.sort((a, b) => {
                let compare = b.status.localeCompare(a.status)
                return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `curl_short`) {
            items.sort((a, b) => {
                let diff = a.curl.length - b.curl.length

                if (diff !== 0) {
                    return diff
                }

                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `curl_long`) {
            items.sort((a, b) => {
                let diff = b.curl.length - a.curl.length

                if (diff !== 0) {
                    return diff
                }

                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `status_short`) {
            items.sort((a, b) => {
                let diff = a.status.length - b.status.length

                if (diff !== 0) {
                    return diff
                }

                return a.curl.localeCompare(b.curl)
            })
        }
        else if (mode === `status_long`) {
            items.sort((a, b) => {
                let diff = b.status.length - a.status.length

                if (diff !== 0) {
                    return diff
                }

                return a.curl.localeCompare(b.curl)
            })
        }
    }

    load_sort() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }
}

const Sort = new SortClass()