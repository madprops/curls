class List {
    constructor(button, input, ls_items, max_items) {
        this.button = button
        this.input = input
        this.ls_items = ls_items
        this.max_items = max_items
        this.menu_max_length = 110
        this.prepare()
    }

    prepare() {
        DOM.ev(this.button, `click`, (e) => {
            this.show_menu(e)
        })

        DOM.ev(this.button, `auxclick`, (e) => {
            if (e.button === 1) {
                this.clear()
            }
        })

        DOM.ev(this.input, `keydown`, (e) => {
            if (e.key === `ArrowUp`) {
                e.preventDefault()
            }
            else if (e.key === `ArrowDown`) {
                e.preventDefault()
            }
            else if (e.key === `Escape`) {
                this.input.value = ``
            }
        })

        DOM.ev(this.input, `keyup`, (e) => {
            if (e.key === `ArrowUp`) {
                this.show_menu()
            }
            else if (e.key === `ArrowDown`) {
                this.show_menu()
            }
        })
    }

    get_items() {
        return Utils.load_array(this.ls_items)
    }

    show_menu(e, show_empty = true) {
        let list = this.get_items()

        if (!list.length) {
            if (show_empty) {
                Windows.alert({
                    title: `Empty List`,
                    message: `Items appear here after you use them`,
                })
            }

            return
        }

        let items = list.map(filter => {
            return {
                text: filter.substring(0, this.menu_max_length),
                action: () => {
                    this.set(filter)
                },
                alt_action: () => {
                    this.remove(filter)
                },
            }
        })

        items.push({
            separator: true,
        })

        items.push({
            text: `Clear`,
            action: () => {
                this.clear()
            },
        })

        let el = DOM.el(`#filter`)
        this.last_e = e
        Utils.context({items: items, element: el, e: e})
    }

    save(value) {
        if (!value) {
            return
        }

        let cleaned = []

        for (let item of this.get_items()) {
            if (item !== value) {
                cleaned.push(item)
            }
        }

        let list = [value, ...cleaned].slice(0, this.max_items)
        Utils.save(this.ls_items, JSON.stringify(list))
    }

    remove(status) {
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

    clear() {
        Windows.confirm({title: `Clear List`, ok: () => {
            Utils.save(this.ls_items, `[]`)
        }, message: `Remove all items from the list`})
    }
}