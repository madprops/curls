/*

This is a button widget
It can be used to cycle through a list of items
It uses NeedContext to show the menu
It's similar to a select widget

*/

class Combo {
    static id = 0

    static register(args = {}) {
        DOM.evs(args.element, [`click`, `contextmenu`], (e) => {
            this.show_menu(args, e)
            e.preventDefault()
        })

        DOM.ev(args.element, `auxclick`, (e) => {
            if (e.button === 1) {
                this.reset(args)
            }
        })

        DOM.ev(args.element, `wheel`, (e) => {
            let direction = Utils.wheel_direction(e)
            this.cycle(args, direction)
            e.preventDefault()
        })

        let lines = [
            args.title,
            `Click to pick option`,
            `Wheel to cycle option`,
            `Middle Click to reset`,
        ]

        args.id = this.id
        args.element.title = lines.join(`\n`)
        this.update_text(args)
        let limit = args.items.length * 2
        Block.register(`combo_${args.id}`, limit)
        this.id += 1
    }

    static get_item(args) {
        return args.items.find(x => x.value === args.get())
    }

    static update_text(args) {
        let item = this.get_item(args)
        args.element.textContent = item.name
    }

    static show_menu(args, e) {
        let items = []
        let current = args.get()

        for (let item of args.items) {
            if (item.value === App.separator) {
                items.push({ separator: true })
            }
            else {
                items.push({
                    text: item.name,
                    action: () => {
                        this.action(args, item.value)
                    },
                    selected: item.value === current,
                    info: item.info,
                    icon: item.icon,
                })
            }
        }

        NeedContext.show({ items: items, e: e })
    }

    static action(args, value) {
        args.action(value)
        this.update_text(args)
    }

    static reset(args) {
        this.action(args, args.default)
    }

    static get_values(args) {
        return args.items
            .filter(x => x.value !== App.separator)
            .filter(x => !x.skip)
            .map(x => x.value)
    }

    static cycle(args, direction) {
        if (Block.charge(`combo_${args.id}`)) {
            return
        }

        let value = args.get()
        let values = this.get_values(args)
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
        this.action(args, new_value)
    }
}