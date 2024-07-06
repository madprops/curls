/*

The border between the items of the container

*/

class Border {
    static default_mode = `solid`
    static ls_name = `border`

    static modes = [
        {value: `solid`, name: `Solid`, info: `Normal solid border`},
        {value: `dotted`, name: `Dotted`, info: `Dotted border`},
        {value: `dashed`, name: `Dashed`, info: `Dashed border`},
        {value: `bigger`, name: `Bigger`, info: `Normal border but twice as thick`},
        {value: App.separator},
        {value: `none`, name: `None`, info: `No border`},
    ]

    static setup() {
        let border = DOM.el(`#border`)
        this.mode = this.load_border()

        this.combo = new Combo({
            title: `Border Modes`,
            items: this.modes,
            value: this.mode,
            element: border,
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
        let border

        if (this.mode === `none`) {
            border = `none`
        }
        else if (this.mode === `bigger`) {
            border = `2px solid var(--color)`
        }
        else {
            border = `1px ${this.mode} var(--color)`
        }

        document.documentElement.style.setProperty(`--border`, border)
    }

    static load_border() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }
}