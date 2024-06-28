App.setup_color = () => {
    let color = DOM.el(`#color`)
    App.color_mode = App.load_color()

    let lines = [
        `Click to pick color`,
        `Wheel to cycle colors`,
        `Middle Click to reset`,
    ]

    color.title = lines.join(`\n`)

    Combo.register({
        items: App.color_modes,
        value: App.color_mode,
        element: color,
        default: `green`,
        action: (value) => {
            App.change_color(value)
        },
        get: () => {
            return App.color_mode
        },

    })

    App.colors_alpha = {}

    for (let color in App.colors) {
        let numbers = App.colors[color].match(/\d+/g)
        let rgba = `rgba(${numbers[0]}, ${numbers[1]}, ${numbers[2]}, 0.18)`
        App.colors_alpha[color] = rgba
    }

    App.apply_color()
}

App.change_color = (value) => {
    if (App.color_mode === value) {
        return
    }

    App.color_mode = value
    localStorage.setItem(`color`, value)
    App.apply_color()
    App.reset_items()
    App.update_curlist()
    App.container_loading()
    App.update(true)
}

App.load_color = () => {
    return localStorage.getItem(`color`) || `green`
}

App.apply_color = () => {
    let rgb = App.colors[App.color_mode]
    let rgba = App.colors_alpha[App.color_mode]
    document.documentElement.style.setProperty(`--color`, rgb)
    document.documentElement.style.setProperty(`--color_alpha`, rgba)
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