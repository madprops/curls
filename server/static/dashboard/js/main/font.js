App.setup_font = () => {
    let font = DOM.el(`#font`)
    App.font_mode = App.load_font()

    Combo.register({
        title: `Font Modes`,
        items: App.font_modes,
        value: App.font_mode,
        element: font,
        default: App.default_font,
        action: (value) => {
            App.change_font(value)
            App.apply_font()
        },
        get: () => {
            return App.font_mode
        },
    })

    App.apply_font()
}

App.change_font = (value) => {
    App.font_mode = value
    localStorage.setItem(`font`, value)
}

App.apply_font = () => {
    document.documentElement.style.setProperty(`--font`, App.font_mode)
}

App.load_font = () => {
    return App.load_modes(`font`, App.font_modes, App.default_font)
}