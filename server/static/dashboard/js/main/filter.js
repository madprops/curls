/*

This is the filter for the container

*/

class Filter {
    static debouncer_delay = 250
    static default_mode = `all`
    static timeout_delay = Utils.SECOND * 3
    static ls_items = `filter_items`
    static max_items = 100

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
        let filter = this.get_filter()

        DOM.ev(filter, `keydown`, (e) => {
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

        DOM.ev(filter, `wheel`, (e) => {
            Utils.scroll_wheel(e)
        })

        this.list = new List(
            button,
            filter,
            this.ls_items,
            this.max_items,
            (value) => {
                this.action(value)
            },
            () => {
                this.clear()
            },
        )
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
        this.get_filter().value = ``
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
        let filter = this.get_filter()

        if (filter.value || (this.mode !== this.default_mode)) {
            this.do_filter()
        }
    }

    static focus() {
        this.get_filter().focus()
    }

    static after() {
        clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
            this.save()
        }, this.timeout_delay)

        Infobar.update_curls()
    }

    static save() {
        let value = this.get_value()
        this.list.save(value)
    }

    static get_items() {
        return Utils.load_array(this.ls_items)
    }

    static get_value() {
        return this.get_filter().value.toLowerCase().trim()
    }

    static get_filter() {
        return DOM.el(`#filter`)
    }

    static action(value) {
        let filter = this.get_filter()
        filter.value = value
        filter.focus()
        this.filter()
    }
}