App.setup_color = () => {
    let color = DOM.el(`#color`)
    let saved = localStorage.getItem(`color`) || `green`
    color.value = saved

    DOM.ev(color, `change`, () => {
        App.change_color()
    })

    App.apply_color()
}

App.change_color = () => {
    let color = App.get_color()
    localStorage.setItem(`color`, color)
    App.apply_color()
}

App.get_color = () => {
    let color = DOM.el(`#color`)
    return color.options[color.selectedIndex].value
}

App.apply_color = () => {
    let color = App.get_color()
    let rgb = App.colors[color]
    document.documentElement.style.setProperty(`--color`, rgb)
}