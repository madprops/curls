App.setup_border = () => {
    let border = DOM.el(`#border`)
    App.border_mode = App.load_border()

    Combo.register({
        title: `Border Modes`,
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
    let border

    if (App.border_mode === `none`) {
        border = `none`
    }
    else if (App.border_mode === `bigger`) {
        border = `2px solid var(--color)`
    }
    else {
        border = `1px ${App.border_mode} var(--color)`
    }

    document.documentElement.style.setProperty(`--border`, border)
}

App.load_border = () => {
    return App.load_modes(`border`, App.border_modes, App.default_border)
}