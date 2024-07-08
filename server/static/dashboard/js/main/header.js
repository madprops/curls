class Header {
    static interval_delay = Utils.SECOND * 30
    static curls_debouncer_delay = 100
    static date_debouncer_delay = 100
    static ls_enabled = `header_enabled`
    static enabled = true

    static setup() {
        let header = DOM.el(`#header`)
        header.title = `Click to scroll to the top`
        this.hide()

        DOM.ev(header, `click`, () => {
            Container.scroll_top()
            Container.do_check_scroll()
        })

        this.start_interval()

        this.curls_debouncer = Utils.create_debouncer(() => {
            this.do_update_curls()
        }, this.curls_debouncer_delay)

        this.date_debouncer = Utils.create_debouncer(() => {
            this.do_update_date()
        }, this.date_debouncer_delay)

        this.enabled = this.load_enabled()
    }

    static start_interval() {
        clearInterval(this.interval)

        if (!this.enabled) {
            return
        }

        this.interval = setInterval(() => {
            this.update_date()
        }, this.interval_delay)
    }

    static update() {
        if (!this.enabled) {
            this.hide()
            return
        }

        if (!Items.list.length) {
            this.hide()
            return
        }

        this.show()
        this.do_update_curls()
        this.do_update_date()
        this.start_interval()
    }

    static update_curls() {
        if (!this.enabled) {
            return
        }

        this.curls_debouncer.call()
    }

    static do_update_curls() {
        this.curls_debouncer.cancel()

        if (!this.enabled) {
            return
        }

        let el = DOM.el(`#header_curls`)
        let visible = Container.get_visible()
        let selected = Select.get()
        let text

        if (visible.length === Items.list.length) {
            text = `${Items.list.length} Curls`
        }
        else {
            text = `${visible.length} / ${Items.list.length} Curls`
        }

        if (selected.length > 1) {
            text += ` (${selected.length})`
        }

        el.textContent = text
    }

    static update_date() {
        if (!this.enabled) {
            return
        }

        this.date_debouncer.call()
    }

    static do_update_date() {
        this.date_debouncer.cancel()

        if (!this.enabled) {
            return
        }

        let el = DOM.el(`#header_date`)
        let ago = Utils.timeago(Update.last_update)
        el.textContent = ago
    }

    static save_enabled() {
        Utils.save(this.ls_enabled, this.enabled)
    }

    static load_enabled() {
        return Utils.load_boolean(this.ls_enabled)
    }

    static hide() {
        DOM.hide(`#header`)
    }

    static show() {
        DOM.show(`#header`)
    }
}