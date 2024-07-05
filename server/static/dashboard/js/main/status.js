/*

This stores status items

*/

class StatusClass {
    constructor () {
        this.max_list = 100
        this.menu_max_length = 110
        this.ls_name = `status_list`
    }

    setup () {
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

        DOM.ev(button, `click`, (e) => {
            this.show_menu(e)
        })
    }

    get_list () {
        let list = Utils.load_array(this.ls_name)

        try {
            return JSON.parse(list)
        }
        catch (e) {
            return []
        }
    }

    save (status) {
        let cleaned = []

        for (let item of this.get_list()) {
            if (item !== status) {
                cleaned.push(item)
            }
        }

        let list = [status, ...cleaned].slice(0, this.max_list)
        Utils.save(this.ls_name, JSON.stringify(list))
    }

    show_menu (e) {
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

    set (status) {
        let el = DOM.el(`#change_status`)
        el.value = status
        this.focus()
    }

    focus () {
        DOM.el(`#change_status`).focus()
    }

    remove (status) {
        Windows.confirm({title: `Remove Status`, ok: () => {
            this.do_remove(status)
        }, message: status.substring(0, 44)})
    }

    do_remove (status) {
        let cleaned = []

        for (let status_ of this.get_list()) {
            if (status_ === status) {
                continue
            }

            cleaned.push(status_)
        }

        Utils.save(this.ls_name, JSON.stringify(cleaned))
    }
}

const Status = new StatusClass()