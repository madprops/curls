/*

Color functions

*/

class Colors {
    static default_mode = `green`
    static ls_name = `color`
    static alpha = {}
    static alpha_2 = {}

    static modes = [
        {value: `red`, name: `Red`, info: `Go to Red`, icon: `🔴`},
        {value: `green`, name: `Green`, info: `Go to Green`, icon: `🟢`},
        {value: `blue`, name: `Blue`, info: `Go to Blue`, icon: `🔵`},
        {value: `yellow`, name: `Yellow`, info: `Go to Yellow`, icon: `🟡`},
        {value: `purple`, name: `Purple`, info: `Go to Purple`, icon: `🟣`},
        {value: `white`, name: `White`, info: `Go to White`, icon: `⚪`},
    ]

    static setup() {
        let color = DOM.el(`#color`)
        this.mode = this.load_color()

        Combo.register({
            title: `Color Modes`,
            items: this.modes,
            value: this.mode,
            element: color,
            default: this.default_mode,
            action: (value) => {
                this.change(value)
            },
            get: () => {
                return this.mode
            },

        })

        this.make_alpha(this.alpha, `0.18`)
        this.make_alpha(this.alpha_2, `0.5`)
        this.apply()
    }

    static make_alpha(obj, a) {
        for (let color in App.colors) {
            let numbers = App.colors[color].match(/\d+/g)
            let rgba = `rgba(${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${a})`
            obj[color] = rgba
        }
    }

    static change(value) {
        if (this.mode === value) {
            return
        }

        this.mode = value
        Utils.save(this.ls_name, value)
        this.apply()
        Items.reset()
        Curlist.update()
        Container.loading()
        Peek.hide()
        Update.update()
    }

    static load_color() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }

    static apply() {
        let normal = App.colors[this.mode]
        let alpha = this.alpha[this.mode]
        let alpha_2 = this.alpha_2[this.mode]
        document.documentElement.style.setProperty(`--color`, normal)
        document.documentElement.style.setProperty(`--color_alpha`, alpha)
        document.documentElement.style.setProperty(`--color_alpha_2`, alpha_2)
        App.update_title()
    }

    static move(curls, e) {
        let items = []

        let add = (mode) => {
            if (this.mode === mode.value) {
                return
            }

            items.push({
                text: mode.name,
                action: () => {
                    this.do_move(mode.value, curls)
                },
                icon: mode.icon,
            })
        }

        for (let key in this.modes) {
            add(this.modes[key])
        }

        NeedContext.show({items: items, e: e})
    }

    static do_move(color, curls) {
        let current_curls = Curls.get()
        let cleaned = []

        for (let curl of current_curls) {
            if (!curls.includes(curl)) {
                cleaned.push(curl)
            }
        }

        let cleaned_items = []

        for (let item of Items.list) {
            if (!curls.includes(item.curl)) {
                cleaned_items.push(item)
            }
        }

        Items.list = cleaned_items
        Curls.save(cleaned)
        let new_curls = Curls.get(color)

        for (let curl of curls) {
            if (!new_curls.includes(curl)) {
                new_curls.unshift(curl)
            }
        }

        Curls.save(new_curls, color)
        Container.update()
        Curlist.update()
    }
}