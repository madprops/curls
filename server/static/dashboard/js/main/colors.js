App.setup_color = () => {
    let color = DOM.el(`#color`)
    let saved = App.load_color()

    let lines = [
        `Click to pick color`,
        `Wheel to cycle colors`,
        `Middle Click to reset`,
    ]

    sort.title = lines.join(`\n`)

    Combo.register({
        items: App.color_modes,
        value: saved,
        element: color,
        default: `green`,
        action: (value) => {
            App.change_color(value)
        },
        get: () => {
            return App.color_mode
        },

    })

    App.apply_color()
}

App.change_color = (value) => {
    if (App.color_mode === value) {
        return
    }

    App.color_mode = value
    localStorage.setItem(`color`, value)
    App.apply_color()
    App.load_curlist()
    App.reset_items()
    App.update(true)
}

App.load_color = () => {
    return localStorage.getItem(`color`) || `green`
}

App.apply_color = () => {
    let rgb = App.colors[App.color_mode]
    document.documentElement.style.setProperty(`--color`, rgb)
    App.update_title()
}

App.move_to_color = (e) => {
    let current = App.color_mode
    let items = []

    function add (value, name) {
        if (current !== value) {
            items.push({
                text: name,
                action: () => {
                    App.do_move_to_color(value, e)
                }
            })
        }
    }

    add(`red`, `Red`)
    add(`green`, `Green`)
    add(`blue`, `Blue`)
    add(`yellow`, `Yellow`)
    add(`purple`, `Purple`)
    add(`white`, `White`)

    NeedContext.show({items: items, e: e})
}

App.do_move_to_color = (color, e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl)
    let curlist = App.get_color_curlist(color)
    curlist += `\n${curl}`
    localStorage.setItem(`curlist_${color}`, curlist)
}

App.get_color_curlist = (color) => {
    return localStorage.getItem(`curlist_${color}`) || ``
}