class Header {
    static interval_delay = Utils.SECOND * 30

    static setup() {
        let header = DOM.el(`#header`)
        header.title = `Click to scroll to the top`
        this.hide()

        DOM.ev(header, `click`, () => {
            Container.scroll_top()
            Container.do_check_scroll()
        })

        this.start_interval()
    }

    static start_interval() {
        clearInterval(this.interval)

        this.interval = setInterval(() => {
            this.update_date()
        }, this.interval_delay)
    }

    static update() {
        this.show()
        this.update_curls()
        this.update_date()
        this.start_interval()
    }

    static hide() {
        DOM.hide(`#header`)
    }

    static show() {
        DOM.show(`#header`)
    }

    static update_curls() {
        let el = DOM.el(`#header_curls`)
        let text = `${Items.list.length} Curls`
        el.textContent = text
    }

    static update_date() {
        let el = DOM.el(`#header_date`)
        let ago = Utils.timeago(Update.last_update)
        let text = `Updated: ${ago}`
        el.textContent = text
    }
}