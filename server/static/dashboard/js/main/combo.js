/*

This is a button widget
It can be used to cycle through a list of items
It uses NeedContext to show the menu
It's similar to a select widget

*/

const Combo = {
    id: 0,
}

Combo.register = (args = {}) => {
    DOM.evs(args.element, [`click`, `contextmenu`], (e) => {
        Combo.show_menu(args, e)
        e.preventDefault()
    })

    DOM.ev(args.element, `auxclick`, (e) => {
        if (e.button === 1) {
            Combo.reset(args)
        }
    })

    DOM.ev(args.element, `wheel`, (e) => {
        let direction = Utils.wheel_direction(e)
        Combo.cycle(args, direction)
        e.preventDefault()
    })

    let lines = [
        args.title,
        `Click to pick option`,
        `Wheel to cycle option`,
        `Middle Click to reset`,
    ]

    args.id = Combo.id
    args.element.title = lines.join(`\n`)
    Combo.update_text(args)
    let limit = args.items.length * 1.5
    Block.register(`combo_${args.id}`, limit)
    Combo.id += 1
}

Combo.get_item = (args) => {
    return args.items.find(x => x.value === args.get())
}

Combo.update_text = (args) => {
    let item = Combo.get_item(args)
    args.element.textContent = item.name
}

Combo.show_menu = (args, e) => {
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
                    Combo.action(args, item.value)
                },
                selected: item.value === current,
                info: item.info,
            })
        }
    }

    NeedContext.show({ items: items, e: e })
}

Combo.action = (args, value) => {
    args.action(value)
    Combo.update_text(args)
}

Combo.reset = (args) => {
    Combo.action(args, args.default)
}

Combo.get_values = (args) => {
    return args.items
        .filter(x => x.value !== App.separator)
        .filter(x => !x.skip)
        .map(x => x.value)
}

Combo.cycle = (args, direction) => {
    if (Block.charge(`combo_${args.id}`)) {
        return
    }

    let value = args.get()
    let values = Combo.get_values(args)
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
    Combo.action(args, new_value)
}