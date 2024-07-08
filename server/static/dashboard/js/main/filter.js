/*

This is the filter for the container

*/

class Filter {
    static debouncer_delay = 250
    static default_mode = `all`
    static timeout_delay = Utils.SECOND * 3
    static ls_items = `filter_items`
    static max_items = 100
    static menu_max_length = 110

    static modes = [
        { value: `all`, name: `All`, info: `Show all curls` },
        { value: App.separator },
        { value: `today`, name: `Today`, info: `Show the curls that changed today` },
        { value: `week`, name: `Week`, info: `Show the curls that changed this week` },
        { value: `month`, name: `Month`, info: `Show the curls that changed this month` },
        { value: App.separator },
        { value: `curl`, name: `Curl`, info: `Filter by curl` },
        { value: `status`, name: `Status`, info: `Filter by status` },
        { value: `date`, name: `Date`, info: `Filter by date` },
        { value: App.separator },
        { value: `owned`, name: `Owned`, info: `Show the curls that you control` },
    ]

    static setup() {
        let filter = DOM.el(`#filter`)

        DOM.ev(filter, `keydown`, (e) => {
            if (e.key === `Escape`) {
                this.clear()
            }

            this.filter()
        })

        this.debouncer = Utils.create_debouncer(() => {
            this.do_filter()
        }, this.debouncer_delay)

        filter.value = ``

        let lines = [
            `Filter the items`,
            `Press Escape to clear`,
        ]

        filter.title = lines.join(`\n`)
        let modes_button = DOM.el(`#filter_modes`)
        this.mode = this.default_mode

        this.combo = new Combo({
            title: `Filter Modes`,
            items: this.modes,
            value: this.filer_mode,
            element: modes_button,
            default: this.default_mode,
            action: (value) => {
                this.change(value)
            },
            get: () => {
                return this.mode
            },
        })

        let button = DOM.el(`#filter_button`)

        DOM.ev(button, `click`, () => {
            this.show_menu()
        })

        DOM.ev(button, `auxclick`, (e) => {
            if (e.button === 1) {
                this.clear()
            }
        })
    }

    static set(value) {
        DOM.el(`#filter`).value = value
        this.filter()
    }

    static change(value) {
        if (this.mode === value) {
            return
        }

        this.mode = value
        this.focus()
        this.do_filter()
    }

    static unfilter() {
        let els = DOM.els(`#container .item`)

        if (!els.length) {
            return
        }

        for (let el of els) {
            DOM.show(el)
        }

        this.after()
    }

    static clear() {
        DOM.el(`#filter`).value = ``
        this.unfilter()
    }

    static filter() {
        this.debouncer.call()
    }

    static do_filter() {
        this.debouncer.cancel()
        let els = Container.get_items()

        if (!els.length) {
            return
        }

        let value = this.get_value()
        let is_special = false
        let special = []
        let scope = `all`

        if (this.mode === `owned`) {
            special = Items.get_owned()
            is_special = true
        }
        else if (this.mode === `today`) {
            special = Items.get_today()
            is_special = true
        }
        else if (this.mode === `week`) {
            special = Items.get_week()
            is_special = true
        }
        else if (this.mode === `month`) {
            special = Items.get_month()
            is_special = true
        }
        else if (this.mode === `curl`) {
            scope = `curl`
            is_special = true
        }
        else if (this.mode === `status`) {
            scope = `status`
            is_special = true
        }
        else if (this.mode === `date`) {
            scope = `date`
            is_special = true
        }

        if (!value && !is_special) {
            this.unfilter()
            return
        }

        if ((scope !== `all`) && !value) {
            this.unfilter()
            return
        }

        let check = (curl, status, updated) => {
            return curl.includes(value) || status.includes(value) || updated.includes(value)
        }

        let hide = (el) => {
            DOM.hide(el)
        }

        let show = (el) => {
            DOM.show(el)
        }

        for (let el of els) {
            let item = Items.get(el.dataset.curl)
            let curl = item.curl.toLowerCase()
            let status = item.status.toLowerCase()
            let updated = item.updated_text.toLowerCase()

            if (scope === `curl`) {
                if (curl.includes(value)) {
                    show(el)
                }
                else {
                    hide(el)
                }
            }
            else if (scope === `status`) {
                if (status.includes(value)) {
                    show(el)
                }
                else {
                    hide(el)
                }
            }
            else if (scope === `date`) {
                if (updated.includes(value)) {
                    show(el)
                }
                else {
                    hide(el)
                }
            }
            else if (is_special) {
                if (special.find(s => s.curl === item.curl)) {
                    if (check(curl, status, updated)) {
                        show(el)
                    }
                    else {
                        hide(el)
                    }
                }
                else {
                    hide(el)
                }
            }
            else {
                if (check(curl, status, updated)) {
                    show(el)
                }
                else {
                    hide(el)
                }
            }
        }

        this.after()
    }

    static check() {
        let filter = DOM.el(`#filter`)

        if (filter.value || (this.mode !== this.default_mode)) {
            this.do_filter()
        }
    }

    static focus() {
        DOM.el(`#filter`).focus()
    }

    static after() {
        clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
            this.add_filter()
        }, this.timeout_delay)

        Infobar.update_curls()
    }

    static add_filter() {
        let value = this.get_value()

        if (!value) {
            return
        }

        let cleaned = [value]

        for (let val of this.get_items()) {
            if (value === val) {
                continue
            }

            cleaned.push(val)

            if (cleaned.length >= this.max_items) {
                break
            }
        }

        Utils.save(this.ls_items, JSON.stringify(cleaned))
    }

    static get_items() {
        let list = Utils.load_array(this.ls_items)

        try {
            return JSON.parse(list)
        }
        catch (e) {
            return []
        }
    }

    static get_value() {
        return DOM.el(`#filter`).value.toLowerCase().trim()
    }

    static show_menu(e) {
        let list = this.get_items()

        if (!list.length) {
            Windows.alert({title: `Empty List`, message: `Filter items appear here after you use them`})
            return
        }

        let items = list.map(filter => {
            return {
                text: filter.substring(0, this.menu_max_length),
                action: () => {
                    this.set(filter)
                },
                alt_action: () => {
                    this.remove(filter)
                },
            }
        })

        items.push({
            separator: true,
        })

        items.push({
            text: `Clear`,
            action: () => {
                this.clear_items()
            },
        })

        let el = DOM.el(`#filter`)
        Utils.context({items: items, element: el, e: e})
    }

    static remove(status) {
        Windows.confirm({title: `Remove Filter`, ok: () => {
            this.do_remove(status)
        }, message: status.substring(0, 44)})
    }

    static do_remove(status) {
        let cleaned = []

        for (let status_ of this.get_items()) {
            if (status_ === status) {
                continue
            }

            cleaned.push(status_)
        }

        Utils.save(this.ls_items, JSON.stringify(cleaned))
    }

    static clear_items() {
        Windows.confirm({title: `Clear List`, ok: () => {
            Utils.save(this.ls_items, `[]`)
        }, message: `Remove all items from the list`})
    }
}