/*

This is a button widget
It can be used to cycle through a list of items
It uses NeedContext to show the menu
It's similar to a select widget

*/

class Combo {
    constructor(args) {
        this.args = args
        this.prepare()
    }

    prepare() {
        DOM.evs(this.args.element, [`click`, `contextmenu`], (e) => {
            this.show_menu(e)
            e.preventDefault()
        })

        DOM.ev(this.args.element, `auxclick`, (e) => {
            if (e.button === 1) {
                this.reset()
            }
        })

        DOM.ev(this.args.element, `wheel`, (e) => {
            let direction = Utils.wheel_direction(e)
            this.cycle(direction)
            e.preventDefault()
        })

        let lines = [
            this.args.title,
            `Click to pick option`,
            `Wheel to cycle option`,
            `Middle Click to reset`,
        ]

        this.args.element.title = lines.join(`\n`)

        if (this.args.extra_title) {
            this.args.element.title += `\n${this.args.extra_title}`
        }

        this.block = new Block()
        this.update_text()
    }

    get_item() {
        return this.args.items.find(x => x.value === this.args.get())
    }

    update_text() {
        let item = this.get_item(this.args)
        this.args.element.textContent = item.name
    }

    show_menu(e) {
        let items = []
        let current = this.args.get()

        for (let item of this.args.items) {
            if (item.value === App.separator) {
                items.push({ separator: true })
            }
            else {
                items.push({
                    text: item.name,
                    action: () => {
                        this.action(item.value)
                    },
                    selected: item.value === current,
                    info: item.info,
                    icon: item.icon,
                })
            }
        }

        Utils.context({ items: items, e: e })
    }

    action(value) {
        this.args.action(value)
        this.update_text()
    }

    reset() {
        this.action(this.args.default)
    }

    get_values() {
        return this.args.items
            .filter(x => x.value !== App.separator)
            .filter(x => !x.skip)
            .map(x => x.value)
    }

    cycle(direction) {
        if (this.block.add_charge()) {
            return
        }

        let value = this.args.get()
        let values = this.get_values(this.args)
        let index = values.indexOf(value)

        if (direction === `up`) {
            index -= 1
        }
        else if (direction === `down`) {
            index += 1
        }

        if (index < 0) {
            index = values.length - 1
        }
        else if (index >= values.length) {
            index = 0
        }

        let new_value = values[index]
        this.action(new_value)
    }

    set_value(value) {
        this.action(value)
    }
}