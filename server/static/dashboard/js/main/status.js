/*

This stores status items

*/

class Status {
    static max_list = 100
    static menu_max_length = 110
    static ls_name = `status_list`

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
            `Change the status of your curl`,
            `Press Enter to change`,
            `Press Arrow Up to show previous status`,
            `Press Arrow Down to show previous status`,
            `Press Escape to clear`,
        ]

        status.title = lines.join(`\n`)

        DOM.ev(button, `click`, (e) => {
            this.show_menu(e)
        })

        DOM.ev(button, `auxclick`, (e) => {
            if (e.button === 1) {
                this.clear()
            }
        })

        let lines_2 = [
            `Use previous status changes`,
            `Middle Click to clear status`,
            `Middle Click items to remove them`,
        ]

        button.title = lines_2.join(`\n`)
    }

    static get_list() {
        let list = Utils.load_array(this.ls_name)

        try {
            return JSON.parse(list)
        }
        catch (e) {
            return []
        }
    }

    static save(status) {
        let cleaned = []

        for (let item of this.get_list()) {
            if (item !== status) {
                cleaned.push(item)
            }
        }

        let list = [status, ...cleaned].slice(0, this.max_list)
        Utils.save(this.ls_name, JSON.stringify(list))
    }

    static show_menu(e) {
        let status_list = this.get_list()

        if (!status_list.length) {
            Windows.alert({title: `Empty List`, message: `this items appear here after you use them`})
            return
        }

        let items = status_list.map(status => {
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

        let el = DOM.el(`#change_status`)
        NeedContext.show({items: items, element: el, e: e})
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
        Windows.confirm({title: `Remove Status`, ok: () => {
            this.do_remove(status)
        }, message: status.substring(0, 44)})
    }

    static do_remove(status) {
        let cleaned = []

        for (let status_ of this.get_list()) {
            if (status_ === status) {
                continue
            }

            cleaned.push(status_)
        }

        Utils.save(this.ls_name, JSON.stringify(cleaned))
    }

    static clear() {
        DOM.el(`#change_status`).value = ``
    }
}