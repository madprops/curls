class List {
    constructor(button, input, ls_items, max_items, action, clear_action) {
        this.button = button
        this.input = input
        this.ls_items = ls_items
        this.max_items = max_items
        this.action = action
        this.clear_action = clear_action
        this.menu_max_length = 110
        this.prepare()
    }

    prepare() {
        DOM.ev(this.button, `click`, (e) => {
            this.show_menu(e)
        })

        DOM.ev(this.button, `auxclick`, (e) => {
            if (e.button === 1) {
                this.clear_action()
            }
        })

        DOM.ev(this.button, `wheel`, (e) => {
            this.cycle(e)
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

        let lines = [
            `Use previous items`,
            `Middle Click to clear input`,
            `Middle Click items to remove`,
            `Wheel to cycle`,
        ]

        this.button.title = lines.join(`\n`)
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

        let items = []

        for (let item of list) {
            items.push({
                text: item.substring(0, this.menu_max_length),
                action: () => {
                    this.action(item)
                },
                alt_action: () => {
                    this.remove(item)
                },

            })
        }

        items.push({
            separator: true,
        })

        items.push({
            text: `Clear`,
            action: () => {
                this.clear()
            },
        })

        this.last_e = e

        Utils.context({
            e: e,
            items: items,
            element: this.button,
        })
    }

    save(value) {
        value = value.trim()

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

    cycle(e) {
        let direction = Utils.wheel_direction(e)

        if (direction === `up`) {
            this.action(this.get_prev())
        }
        else {
            this.action(this.get_next())
        }
    }

    get_next() {
        let list = this.get_items()
        let current = this.input.value.trim()
        let index = list.indexOf(current)

        if (index === -1) {
            return list[0]
        }

        if (index === list.length - 1) {
            return list[0]
        }

        return list[index + 1]
    }

    get_prev() {
        let list = this.get_items()
        let current = this.input.value.trim()
        let index = list.indexOf(current)

        if (index === -1) {
            return Utils.last(list)
        }

        if (index === 0) {
            return list[list.length - 1]
        }

        return list[index - 1]
    }
}