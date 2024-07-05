/*

This is a popup that appears at the top right corner
This display a curl in full, and can be closed
It's closed automatically on focus changes

*/

class PeekClass {
    constructor () {
        this.enabled = true
        this.open = false
        this.curl = ``
        this.debouncer_delay = 50
        this.ls_name = `peek_enabled`
    }

    setup () {
        this.enabled = this.load_enabled()

        this.debouncer = Utils.create_debouncer((args) => {
            this.do_show(args)
        }, this.debouncer_delay)
    }

    save_enabled () {
        Utils.save(this.ls_name, this.enabled)
    }

    load_enabled () {
        return Utils.load_boolean(this.ls_name)
    }

    show (args) {
        this.debouncer.call(args)
    }

    do_show (args = {}) {
        this.debouncer.cancel()

        let def_args = {
            force: false,
        }

        Utils.def_args(def_args, args)

        if (!this.enabled && !args.force) {
            return
        }

        if (this.open && (this.curl === args.curl)) {
            return
        }

        let peek = DOM.el(`#peek`)
        let item = Items.get(args.curl)

        if (!item) {
            return
        }

        let icon = DOM.create(`div`, `peek_icon`)
        let canvas = DOM.create(`canvas`, `peek_icon_canvas`)
        jdenticon.update(canvas, item.curl)
        icon.append(canvas)
        let curl_ = DOM.create(`div`, `peek_curl`)
        curl_.textContent = item.curl
        let status = DOM.create(`div`, `peek_status`)
        status.innerHTML = Utils.sanitize(item.status)
        let updated = DOM.create(`div`, `peek_updated`)
        updated.textContent = item.updated_text

        DOM.ev(icon, `click`, (e) => {
            Items.show_menu({curl: args.curl, e: e, from: `peek`})
        })

        icon.title = `Click to show menu`

        let close = DOM.create(`div`, `peek_close glow_white noselect`)
        close.textContent = `Close`

        DOM.ev(close, `click`, () => {
            this.hide()
        })

        peek.innerHTML = ``
        peek.append(icon)
        peek.append(curl_)
        peek.append(status)
        peek.append(close)
        peek.append(updated)

        peek.classList.add(`active`)
        this.open = true
        this.curl = args.curl
    }

    hide () {
        if (!this.open) {
            return
        }

        DOM.el(`#peek`).classList.remove(`active`)
        this.open = false
        this.curl = ``
    }
}

const Peek = new PeekClass()