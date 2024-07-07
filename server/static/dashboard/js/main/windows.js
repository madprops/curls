/*

This creates and shows modal windows

*/

class Windows {
    static max_items = 1000

    static create(color) {
        let common = {
            enable_titlebar: true,
            center_titlebar: true,
            window_x: `none`,
            after_close: () => {
                Container.focus()
            },
        }

        return Msg.factory(Object.assign({}, common, {
            class: color,
        }))
    }

    static setup() {
        let alert_template = DOM.el(`#alert_template`)
        let alert_html = alert_template.innerHTML
        this.alert_window = this.create(`green`)
        this.alert_window.set(alert_html)
        this.prompt_window = this.create(`blue`)
        let copy = DOM.el(`#alert_copy`)

        DOM.ev(copy, `click`, () => {
            this.alert_copy()
        })

        let alert_ok = DOM.el(`#alert_ok`)

        DOM.ev(alert_ok, `click`, (e) => {
            this.alert_window.close()
        })

        let prompt_template = DOM.el(`#prompt_template`)
        let prompt_html = prompt_template.innerHTML
        this.prompt_window.set(prompt_html)
        this.prompt_window.set_title(`Prompt`)
        let submit = DOM.el(`#prompt_submit`)
        let input = DOM.el(`#prompt_input`)

        DOM.ev(submit, `click`, () => {
            this.prompt_submit()
        })

        DOM.ev(input, `keydown`, (e) => {
            if (e.key === `Enter`) {
                this.prompt_submit()
            }
        })

        this.confirm_window = this.create(`red`)
        let confirm_template = DOM.el(`#confirm_template`)
        let confirm_html = confirm_template.innerHTML
        this.confirm_window.set(confirm_html)

        let ok = DOM.el(`#confirm_ok`)

        DOM.ev(ok, `click`, () => {
            this.confirm_ok()
            this.confirm_window.close()
        })

        DOM.ev(ok, `keydown`, (e) => {
            if (e.key === `Enter`) {
                this.confirm_ok()
                this.confirm_window.close()
            }
        })
    }

    static alert(args = {}) {
        let def_args = {
            title: `Information`,
            message: ``,
            copy: false,
            ok: true,
        }

        Utils.def_args(def_args, args)
        this.alert_window.set_title(args.title)
        let msg = DOM.el(`#alert_message`)

        if (args.message) {
            DOM.show(msg)
            msg.textContent = args.message
        }
        else {
            DOM.hide(msg)
        }

        let copy = DOM.el(`#alert_copy`)

        if (args.copy) {
            DOM.show(copy)
        }
        else {
            DOM.hide(copy)
        }

        let ok = DOM.el(`#alert_ok`)

        if (args.ok) {
            DOM.show(ok)
        }
        else {
            DOM.hide(ok)
        }

        this.alert_window.show()
    }

    static alert_copy() {
        let text = DOM.el(`#alert_message`)
        Utils.copy_to_clipboard(text.textContent)
        this.alert_window.close()
    }

    static confirm(args = {}) {
        let def_args = {
            message: ``,
        }

        Utils.def_args(def_args, args)
        this.confirm_ok = args.ok
        this.confirm_window.set_title(args.title)
        this.confirm_window.show()
        DOM.el(`#confirm_ok`).focus()
        let msg = DOM.el(`#confirm_message`)

        if (args.message) {
            msg.textContent = args.message
            DOM.show(msg)
        }
        else {
            DOM.hide(msg)
        }
    }

    static prompt_submit() {
        let value = DOM.el(`#prompt_input`).value.trim()
        this.prompt_callback(value)
        this.prompt_window.close()
    }

    static prompt(args = {}) {
        let def_args = {
            value: ``,
            message: ``,
        }

        Utils.def_args(def_args, args)
        this.prompt_callback = args.callback
        let input = DOM.el(`#prompt_input`)
        input.value = args.value
        this.prompt_window.set_title(args.title)
        let msg = DOM.el(`#prompt_message`)

        if (args.message) {
            msg.textContent = args.message
            DOM.show(msg)
        }
        else {
            DOM.hide(msg)
        }

        this.prompt_window.show()
        input.focus()
    }

    static alert_export(data) {
        let data_str = Utils.sanitize(JSON.stringify(data))
        this.alert({title: `Copy the data below`, message: data_str, copy: true, ok: false})
    }
}