App.setup_color = () => {
    let color = DOM.el(`#color`)
    color.value = App.load_color()

    DOM.ev(color, `change`, (e) => {
        App.change_color(e)
    })

    App.apply_color()
}

App.change_color = (e) => {
    let color = e.target.value
    localStorage.setItem(`color`, color)
    App.apply_color()
    App.load_curlist()
    App.reset_items()
    App.update(true)
}

App.load_color = () => {
    return localStorage.getItem(`color`) || `green`
}

App.get_color = () => {
    return DOM.el(`#color`).value
}

App.apply_color = () => {
    let rgb = App.colors[App.get_color()]
    document.documentElement.style.setProperty(`--color`, rgb)
    App.update_title()
}

App.move_to_color = (e) => {
    let current = App.get_color()
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