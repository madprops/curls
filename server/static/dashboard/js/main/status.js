/*

This stores status items

*/

class Status {
    static max_items = 100
    static menu_max_length = 110
    static ls_items = `status_items`

    static setup() {
        let status = DOM.el(`#change_status`)
        let button = DOM.el(`#status_button`)

        DOM.ev(status, `keydown`, (e) => {
            if (e.key === `ArrowUp`) {
                e.preventDefault()
            }
            else if (e.key === `ArrowDown`) {
                e.preventDefault()
            }
            else if (e.key === `Enter`) {
                Change.change()
            }
            else if (e.key === `Escape`) {
                status.value = ``
            }
        })

        DOM.ev(status, `wheel`, (e) => {
            Utils.scroll_wheel(e)
        })

        DOM.ev(status, `keyup`, (e) => {
            if (e.key === `ArrowUp`) {
                this.show_menu()
            }
            else if (e.key === `ArrowDown`) {
                this.show_menu()
            }
        })

        status.value = ``

        let lines = [
            `Enter the new status of the curl`,
            `Press Enter to submit the change`,
            `Press Arrow Up/Down to show previous`,
            `Press Escape to clear`,
        ]

        status.title = lines.join(`\n`)

        DOM.ev(button, `click`, (e) => {
            this.show_menu(e)
        })

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
    }

    static get_items() {
        return Utils.load_array(this.ls_items)
    }

    static save(status) {
        let cleaned = []

        for (let item of this.get_items()) {
            if (item !== status) {
                cleaned.push(item)
            }
        }

        let list = [status, ...cleaned].slice(0, this.max_items)
        Utils.save(this.ls_items, JSON.stringify(list))
    }

    static show_menu(e, show_empty = true) {
        let list = this.get_items()

        if (!list.length) {
            if (show_empty) {
                Windows.alert({
                    title: `Empty List`,
                    message: `Status items appear here after you use them`
                })
            }

            return
        }

        let items = list.map(status => {
            return {
                text: status.substring(0, this.menu_max_length),
                action: () => {
                    this.set(status)
                },
                alt_action: () => {
                    this.remove(status)
                },
            }
        })

        items.push({
            separator: true,
        })

        items.push({
            text: `Clear`,
            action: () => {
                this.clear_items()
            },
        })

        let el = DOM.el(`#change_status`)
        this.last_e = e
        Utils.context({items: items, element: el, e: e})
    }

    static set(status) {
        let el = DOM.el(`#change_status`)
        el.value = status
        this.focus()
    }

    static focus() {
        DOM.el(`#change_status`).focus()
    }

    static remove(status) {
        let cleaned = []

        for (let status_ of this.get_items()) {
            if (status_ === status) {
                continue
            }

            cleaned.push(status_)
        }

        Utils.save(this.ls_items, JSON.stringify(cleaned))
        this.show_menu(this.last_e, false)
    }

    static clear_status() {
        DOM.el(`#change_status`).value = ``
    }

    static clear_items() {
        Windows.confirm({title: `Clear List`, ok: () => {
            Utils.save(this.ls_items, `[]`)
        }, message: `Remove all items from the list`})
    }
}