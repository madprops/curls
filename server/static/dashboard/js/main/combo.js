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
        Combo.cycle(args)
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
        items.push({
            text: mode.name,
            action: () => {
                args.action(mode.value)
                Combo.update_name(args)
            }
        })
    }

    NeedContext.show({items: items, e: e})
}