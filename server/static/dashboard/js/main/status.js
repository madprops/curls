/*

This stores status items

*/

class Status {
    static max_items = 100
    static ls_items = `status_items`

    static setup() {
        let status = DOM.el(`#change_status`)
        let button = DOM.el(`#status_button`)

        DOM.ev(status, `keyup`, (e) => {
            if (e.key === `Enter`) {
                Change.change()
            }
        })

        DOM.ev(status, `wheel`, (e) => {
            Utils.scroll_wheel(e)
        })

        status.value = ``

        let lines = [
            `Enter the new status of the curl`,
            `Press Enter to submit the change`,
            `Press Escape to clear`,
        ]

        status.title = lines.join(`\n`)

        DOM.ev(button, `auxclick`, (e) => {
            if (e.button === 1) {
                this.clear_status()
            }
        })

        let lines_2 = [
            `Use previous status changes`,
            `Middle Click to clear status`,
            `Middle Click items to remove them`,
        ]

        button.title = lines_2.join(`\n`)

        this.list = new List(
            button,
            status,
            this.ls_items,
            this.max_items,
            () => {
                // Do nothing
            },
        )
    }

    static save(status) {
        this.list.save(status)
    }

    static get_items() {
        return Utils.load_array(this.ls_items)
    }

    static focus() {
        DOM.el(`#change_status`).focus()
    }

    static clear_status() {
        DOM.el(`#change_status`).value = ``
    }
}