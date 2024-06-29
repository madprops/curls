App.setup_border = () => {
    let border = DOM.el(`#border`)
    App.border_mode = App.load_border()

    Combo.register({
        items: App.border_modes,
        value: App.border_mode,
        element: border,
        default: App.default_border,
        action: (value) => {
            App.change_border(value)
            App.apply_border()
        },
        get: () => {
            return App.border_mode
        },
    })

    App.apply_border()
}

App.change_border = (value) => {
    App.border_mode = value
    localStorage.setItem(`border`, value)
}

App.apply_border = () => {
    document.documentElement.style.setProperty(`--border`, App.border_mode)
}

App.load_border = () => {
    let saved = localStorage.getItem(`border`) || App.default_border
    let values = App.clean_modes(App.border_modes).map(x => x.value)

    if (!values.includes(saved)) {
        saved = App.default_border
    }

    return saved
}