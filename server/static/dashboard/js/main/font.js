/*

The font of the interface

*/

class Font {
    static default_mode = `sans-serif`
    static ls_name = `font`

    static modes = [
        {value: `sans-serif`, name: `Sans`, info: `Use Sans-Serif as the font`},
        {value: `serif`, name: `Serif`, info: `Use Serif as the font`},
        {value: `monospace`, name: `Mono`, info: `Use Monospace as the font`},
        {value: `cursive`, name: `Cursive`, info: `Use Cursive as the font`},
    ]

    static setup() {
        let font = DOM.el(`#font`)
        this.mode = this.load_font()

        Combo.register({
            title: `Font Modes`,
            items: this.modes,
            value: this.mode,
            element: font,
            default: this.default_mode,
            action: (value) => {
                this.change(value)
                this.apply()
            },
            get: () => {
                return this.mode
            },
        })

        this.apply()
    }

    static change(value) {
        this.mode = value
        Utils.save(this.ls_name, value)
    }

    static apply() {
        document.documentElement.style.setProperty(`--font`, this.mode)
    }

    static load_font() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }
}