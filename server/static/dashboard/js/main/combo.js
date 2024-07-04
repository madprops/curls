const Combo = {}

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
        let direction = App.wheel_direction(e)
        Combo.cycle(args, direction)
        e.preventDefault()
    })

    let lines = [
        args.title,
        `Click to pick option`,
        `Wheel to cycle option`,
        `Middle Click to reset`,
    ]

    args.element.title = lines.join(`\n`)

    Combo.update_text(args)
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
    let value = args.get()
    let values = Combo.get_values(args)
    let index = values.indexOf(value)

    if (direction === `up`) {
        index--
    }
    else if (direction === `down`) {
        index++
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