/*

This is a button that sits on the footer
It is used to toggle some options

*/

class More {
    static setup() {
        let button = DOM.el(`#footer_more`)

        DOM.ev(button, `click`, (e) => {
            this.show_menu(e)
        })

        DOM.ev(button, `auxclick`, (e) => {
            if (e.button == 1) {
                this.reset(e)
            }
        })

        let lines = [
            `More options`,
            `Middle Click to reset`,
        ]

        button.title = lines.join(`\n`)
    }

    static change_wrap(what, actions = true) {
        if (Container.wrap_enabled == what) {
            return
        }

        Container.wrap_enabled = what
        Container.save_wrap_enabled()

        if (actions) {
            Container.update()
        }

        this.popup(`Wrap`, what)
    }

    static change_controls(what, actions = true) {
        if (Controls.enabled == what) {
            return
        }

        Controls.enabled = what
        Controls.save_enabled()

        if (actions) {
            Controls.check_enabled()
        }

        this.popup(`Controls`, what)
    }

    static change_dates(what, actions = true) {
        if (Dates.enabled == what) {
            return
        }

        Dates.enabled = what
        Dates.save_enabled()

        if (actions) {
            Container.update()
        }

        this.popup(`Dates`, what)
    }

    static show_menu(e) {
        let items = []

        if (Container.wrap_enabled) {
            items.push({
                text: `Disable Wrap`,
                action: () => {
                    this.change_wrap(false)
                },
                info: `Disable text wrapping in the container`,
            })
        }
        else {
            items.push({
                text: `Enable Wrap`,
                action: () => {
                    this.change_wrap(true)
                },
                info: `Enable text wrapping in the container`,
            })
        }

        if (Dates.enabled) {
            items.push({
                text: `Disable Dates`,
                action: () => {
                    this.change_dates(false)
                },
                info: `Disable dates in the container`,
            })
        }
        else {
            items.push({
                text: `Enable Dates`,
                action: () => {
                    this.change_dates(true)
                },
                info: `Enable dates in the container`,
            })
        }

        if (Controls.enabled) {
            items.push({
                text: `Disable Controls`,
                action: () => {
                    this.change_controls(false)
                },
                info: `Disable the controls`,
            })
        }
        else {
            items.push({
                text: `Enable Controls`,
                action: () => {
                    this.change_controls(true)
                },
                info: `Enable the controls`,
            })
        }

        Utils.context({items: items, e: e})
    }

    static reset() {
        let vars = [
            Container.wrap_enabled,
            Dates.enabled,
            Controls.enabled,
            Infobar.enabled,
        ]

        if (vars.every((x) => x)) {
            return
        }

        Windows.confirm({title: `Reset Options`, ok: () => {
            this.do_reset()
        }, message: `Reset all options to default`})
    }

    static do_reset() {
        this.change_wrap(true, false)
        this.change_controls(true, false)
        this.change_dates(true, false)
        Controls.check_enabled()
        Container.update()
        Infobar.update()
    }

    static popup(what, value) {
        let text = `${what} ${value ? `Enabled` : `Disabled`}`
        Windows.popup(text)
    }
}