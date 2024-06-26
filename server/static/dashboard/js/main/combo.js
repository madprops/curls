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

    Combo.update_name(args)
}

Combo.get_item = (args) => {
    return args.items.find(x => x.value === args.get())
}

Combo.update_name = (args) => {
    let mode = Combo.get_item(args)
    args.element.textContent = mode.name
}

Combo.show_menu = (args, e) => {
    let items = []

    for (let mode of App.sort_modes) {
        if (mode.value === App.separator) {
            items.push({separator: true})
        }
        else {
            items.push({
                text: mode.name,
                action: () => {
                    Combo.action(args, mode.value)
                }
            })
        }
    }

    NeedContext.show({items: items, e: e})
}

Combo.action = (args, value) => {
    args.action(value)
    Combo.update_name(args)
}

Combo.reset = (args) => {
    Combo.action(args, args.default)
}

Combo.get_values = (args) => {
    return args.items
    .filter(x => x.value !== App.separator)
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