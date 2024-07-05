/*

This is the filter for the container

*/

class FilterClass {
    constructor() {
        this.debouncer_delay = 250
        this.default_mode = `all`
        this.ls_name = `filter`

        this.modes = [
            {value: `all`, name: `All`, info: `Show all curls`},
            {value: App.separator},
            {value: `today`, name: `Today`, info: `Show the curls that changed today`},
            {value: `week`, name: `Week`, info: `Show the curls that changed this week`},
            {value: `month`, name: `Month`, info: `Show the curls that changed this month`},
            {value: App.separator},
            {value: `curl`, name: `Curl`, info: `Filter by curl`},
            {value: `status`, name: `Status`, info: `Filter by status`},
            {value: `date`, name: `Date`, info: `Filter by date`},
            {value: App.separator},
            {value: `owned`, name: `Owned`, info: `Show the curls that you control`},
        ]
    }

    setup() {
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

        let button = DOM.el(`#filter_button`)
        this.mode = this.load_filter()

        Combo.register({
            title: `this Modes`,
            items: this.modes,
            value: this.filer_mode,
            element: button,
            default: this.default_mode,
            action: (value) => {
                this.change(value)
            },
            get: () => {
                return this.mode
            },
        })
    }

    load_filter() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }

    change(value) {
        if (this.mode === value) {
            return
        }

        this.mode = value
        this.focus()
        this.do_filter()
        Utils.save(this.ls_name, value)
    }

    unfilter() {
        let els = DOM.els(`#container .item`)

        if (!els.length) {
            return
        }

        for (let el of els) {
            el.classList.remove(`hidden`)
        }
    }

    clear() {
        DOM.el(`#filter`).value = ``
        this.unfilter()
    }

    filter() {
        this.debouncer.call()
    }

    do_filter() {
        this.debouncer.cancel()
        let els = Container.get_items()

        if (!els.length) {
            return
        }

        let value = DOM.el(`#filter`).value.toLowerCase().trim()
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

        function check(curl, status, updated) {
            return curl.includes(value) || status.includes(value) || updated.includes(value)
        }

        function hide(el) {
            DOM.hide(el)
        }

        function show(el) {
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
    }

    check() {
        let filter = DOM.el(`#filter`)

        if (filter.value || (this.mode !== this.default_mode)) {
            this.do_filter()
        }
    }

    focus() {
        DOM.el(`#filter`).focus()
    }
}

const Filter = new FilterClass()