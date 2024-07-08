class Infobar {
    static interval_delay = Utils.SECOND * 30
    static curls_debouncer_delay = 100
    static date_debouncer_delay = 100

    static setup() {
        let infobar = DOM.el(`#infobar`)
        infobar.title = `Number of curls being monitored, and how long ago they were updated`
        this.hide()

        DOM.ev(infobar, `click`, () => {
            Container.scroll_top()
        })

        DOM.ev(infobar, `contextmenu`, (e) => {
            e.preventDefault()
            Menu.show(e)
        })

        DOM.ev(infobar, `auxclick`, (e) => {
            if (e.button === 1) {
                Container.scroll_bottom()
            }
        })

        DOM.ev(infobar, `wheel`, (e) => {
            let direction = Utils.wheel_direction(e)

            if (direction === `up`) {
                Container.scroll_up()
            }
            else {
                Container.scroll_down()
            }
        })

        this.start_interval()

        this.curls_debouncer = Utils.create_debouncer(() => {
            this.do_update_curls()
        }, this.curls_debouncer_delay)

        this.date_debouncer = Utils.create_debouncer(() => {
            this.do_update_date()
        }, this.date_debouncer_delay)
    }

    static start_interval() {
        clearInterval(this.interval)

        this.interval = setInterval(() => {
            this.update_date()
        }, this.interval_delay)
    }

    static update() {
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
        this.curls_debouncer.call()
    }

    static do_update_curls() {
        this.curls_debouncer.cancel()
        let el = DOM.el(`#infobar_curls`)
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
        this.date_debouncer.call()
    }

    static do_update_date() {
        this.date_debouncer.cancel()
        let el = DOM.el(`#infobar_date`)
        let ago = Utils.timeago(Update.last_update)
        el.textContent = ago
    }

    static hide() {
        DOM.hide(`#infobar`)
    }

    static show() {
        DOM.show(`#infobar`)
    }
}