App.setup_font = () => {
    let font = DOM.el(`#font`)
    App.font_mode = App.load_font()

    Combo.register({
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
    let saved = localStorage.getItem(`font`) || App.default_font
    let values = App.clean_modes(App.font_modes).map(x => x.value)

    if (!values.includes(saved)) {
        saved = App.default_font
    }

    return saved
}