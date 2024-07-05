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

    static change_highlight(what) {
        Container.highlight_enabled = what
        Container.save_highlight_enabled()
    }

    static change_peek(what) {
        Peek.enabled = what
        Peek.save_enabled()
    }

    static change_wrap(what, actions = true) {
        Container.wrap_enabled = what
        Container.save_wrap_enabled()

        if (actions) {
            Container.update()
        }
    }

    static change_controls(what, actions = true) {
        Controls.enabled = what
        Controls.save_enabled()

        if (actions) {
            Controls.check_enabled()
        }
    }

    static show_menu(e) {
        let items = []

        if (Container.highlight_enabled) {
            items.push({
                text: `Disable Highlight`,
                action: () => {
                    this.change_highlight(false)
                },
                info: `Disable the highlight effect on the container when selecting items in the curlist`,
            })
        }
        else {
            items.push({
                text: `Enable Highlight`,
                action: () => {
                    this.change_highlight(true)
                },
                info: `Enable the highlight effect on the container when selecting items in the curlist`,
            })
        }

        if (Peek.enabled) {
            items.push({
                text: `Disable Peek`,
                action: () => {
                    this.change_peek(false)
                },
                info: `Disable peek when selecting items in the curlist`,
            })
        }
        else {
            items.push({
                text: `Enable Peek`,
                action: () => {
                    this.change_peek(true)
                },
                info: `Enable peek when selecting items in the curlist`,
            })
        }

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

        NeedContext.show({items: items, e: e})
    }

    static reset() {
        let vars = [
            Container.highlight_enabled,
            Peek.enabled,
            Container.wrap_enabled,
            Controls.enabled,
        ]

        if (vars.every((x) => x)) {
            return
        }

        Windows.confirm({title: `Reset Options`, ok: () => {
            this.do_reset()
        }, message: `Reset all options to default`})
    }

    static do_reset() {
        this.change_highlight(true)
        this.change_peek(true)
        this.change_wrap(true, false)
        this.change_controls(true, false)
        Controls.check_enabled()
        Container.update()
    }
}