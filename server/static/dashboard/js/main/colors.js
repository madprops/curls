/*

Color functions

*/

const Colors = {
    default_mode: `green`,
    ls_name: `color`,
}

Colors.modes = [
    {value: `red`, name: `Red`, info: `Go to Red`},
    {value: `green`, name: `Green`, info: `Go to Green`},
    {value: `blue`, name: `Blue`, info: `Go to Blue`},
    {value: `yellow`, name: `Yellow`, info: `Go to Yellow`},
    {value: `purple`, name: `Purple`, info: `Go to Purple`},
    {value: `white`, name: `White`, info: `Go to White`},
]

Colors.setup = () => {
    let color = DOM.el(`#color`)
    Colors.mode = Colors.load_color()

    Combo.register({
        title: `Color Modes`,
        items: Colors.modes,
        value: Colors.mode,
        element: color,
        default: Colors.default_mode,
        action: (value) => {
            Colors.change(value)
        },
        get: () => {
            return Colors.mode
        },

    })

    Colors.make_alpha(App.colors_alpha, `0.18`)
    Colors.make_alpha(App.colors_alpha_2, `0.5`)
    Colors.apply()
}

Colors.make_alpha = (obj, a) => {
    for (let color in App.colors) {
        let numbers = App.colors[color].match(/\d+/g)
        let rgba = `rgba(${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${a})`
        obj[color] = rgba
    }
}

Colors.change = (value) => {
    if (Colors.mode === value) {
        return
    }

    Colors.mode = value
    App.save(Colors.ls_name, value)
    Colors.apply()
    Items.reset()
    Curlist.update()
    Container.loading()
    Peek.hide()
    Update.now()
}

Colors.load_color = () => {
    return App.load_modes(Colors.ls_name, Colors.modes, Colors.default_mode)
}

Colors.apply = () => {
    let normal = App.colors[Colors.mode]
    let alpha = App.colors_alpha[Colors.mode]
    let alpha_2 = App.colors_alpha_2[Colors.mode]
    document.documentElement.style.setProperty(`--color`, normal)
    document.documentElement.style.setProperty(`--color_alpha`, alpha)
    document.documentElement.style.setProperty(`--color_alpha_2`, alpha_2)
    App.update_title()
}

Colors.move = (curls, e) => {
    let items = []

    function add (value, name) {
        if (Colors.mode === value) {
            return
        }

        items.push({
            text: name,
            action: () => {
                Colors.do_move(value, curls)
            }
        })
    }

    for (let key in Colors.modes) {
        let mode = Colors.modes[key]
        add(mode.value, mode.name)
    }

    NeedContext.show({items: items, e: e})
}

Colors.do_move = (color, curls) => {
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