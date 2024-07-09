/*

This stores status items

*/

class Status {
    static max_items = 100
    static ls_items = `status_items`

    static setup() {
        let status = this.get_status()
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

        this.list = new List(
            button,
            status,
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

    static save(status) {
        this.list.save(status)
    }

    static get_items() {
        return Utils.load_array(this.ls_items)
    }

    static focus() {
        this.get_status().focus()
    }

    static clear() {
        this.get_status().value = ``
    }

    static get_status() {
        return DOM.el(`#change_status`)
    }

    static action(value) {
        let status = this.get_status()
        status.value = value
        status.focus()
    }
}