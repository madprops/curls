/*

The border between the items of the container

*/

class BorderClass {
    constructor() {
        this.default_mode = `solid`
        this.ls_name = `border`

        this.modes = [
            {value: `solid`, name: `Solid`, info: `Normal solid border`},
            {value: `dotted`, name: `Dotted`, info: `Dotted border`},
            {value: `dashed`, name: `Dashed`, info: `Dashed border`},
            {value: `bigger`, name: `Bigger`, info: `Normal border but twice as thick`},
            {value: App.separator},
            {value: `none`, name: `None`, info: `No border`},
        ]
    }

    setup() {
        let border = DOM.el(`#border`)
        this.mode = this.load_border()

        Combo.register({
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

    change(value) {
        this.mode = value
        Utils.save(this.ls_name, value)
    }

    apply() {
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

    load_border() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }
}

const Border = new BorderClass()