/*

The border between the items of the container

*/

const Border = {
    default_mode: `solid`,
    ls_name: `border`,
}

Border.modes = [
    {value: `solid`, name: `Solid`, info: `Normal solid border`},
    {value: `dotted`, name: `Dotted`, info: `Dotted border`},
    {value: `dashed`, name: `Dashed`, info: `Dashed border`},
    {value: `bigger`, name: `Bigger`, info: `Normal border but twice as thick`},
    {value: App.separator},
    {value: `none`, name: `None`, info: `No border`},
]

Border.setup = () => {
    let border = DOM.el(`#border`)
    Border.mode = App.load_border()

    Combo.register({
        title: `Border Modes`,
        items: Border.modes,
        value: Border.mode,
        element: border,
        default: App.default_border,
        action: (value) => {
            Border.change(value)
            Border.apply()
        },
        get: () => {
            return Border.mode
        },
    })

    Border.apply()
}

Border.change = (value) => {
    Border.mode = value
    App.save(Border.ls_name, value)
}

Border.apply = () => {
    let border

    if (Border.mode === `none`) {
        border = `none`
    }
    else if (Border.mode === `bigger`) {
        border = `2px solid var(--color)`
    }
    else {
        border = `1px ${Border.mode} var(--color)`
    }

    document.documentElement.style.setProperty(`--border`, border)
}

App.load_border = () => {
    return App.load_modes(Border.ls_name, Border.modes, App.default_border)
}