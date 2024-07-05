/*

The font of the interface

*/

const Font = {
    default_mode: `sans-serif`,
    ls_name: `font`,
}

Font.modes = [
    {value: `sans-serif`, name: `Sans`, info: `Use Sans-Serif as the font`},
    {value: `serif`, name: `Serif`, info: `Use Serif as the font`},
    {value: `monospace`, name: `Mono`, info: `Use Monospace as the font`},
    {value: `cursive`, name: `Cursive`, info: `Use Cursive as the font`},
]

Font.setup = () => {
    let font = DOM.el(`#font`)
    Font.mode = Font.load_font()

    Combo.register({
        title: `Font Modes`,
        items: Font.modes,
        value: Font.mode,
        element: font,
        default: Font.default_mode,
        action: (value) => {
            Font.change(value)
            Font.apply()
        },
        get: () => {
            return Font.mode
        },
    })

    Font.apply()
}

Font.change = (value) => {
    Font.mode = value
    Utils.save(Font.ls_name, value)
}

Font.apply = () => {
    document.documentElement.style.setProperty(`--font`, Font.mode)
}

Font.load_font = () => {
    return Utils.load_modes(Font.ls_name, Font.modes, Font.default_mode)
}