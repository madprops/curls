/*

Color functions

*/

class Colors {
  static default_mode = `green`
  static ls_name = `color`
  static alpha_0 = {}
  static alpha_1 = {}
  static alpha_2 = {}

  static colors = {
    green: `rgb(87, 255, 87)`,
    blue: `rgb(118, 120, 255)`,
    red: `rgb(255, 89, 89)`,
    yellow: `rgb(255, 219, 78)`,
    orange: `rgb(255, 159, 67)`,
    pink: `rgb(255, 100, 255)`,
    purple: `rgb(178, 102, 255)`,
    brown: `rgb(150, 75, 0)`,
    teal: `rgb(0, 255, 255)`,
    gold: `rgb(255, 215, 0)`,
    silver: `rgb(192, 192, 192)`,
    bronze: `rgb(205, 127, 50)`,
    white: `rgb(0, 0, 0)`,
    black: `rgb(255, 255, 255)`,
    gray: `rgba(127, 127, 127, 1)`,
  }

  static modes = []
  static full_modes = []

  static {
    for (let key in this.colors) {
      let name = Utils.capitalize(key)
      let color_value = this.colors[key]
      let icon = DOM.create(`div`, `color_icon`)
      icon.style.backgroundColor = this.colors[key]

      let obj = {
        name,
        icon,
        color: color_value,
        value: key,
        info: `Go to ${name}`,
      }

      this.modes.push(obj)
      this.full_modes.push(obj)

      if ([`red`, `pink`, `bronze`, `teal`].includes(key)) {
        this.full_modes.push({value: Utils.separator})
      }
    }
  }

  static setup() {
    let color = DOM.el(`#color`)
    this.mode = this.load_color()

    this.combo = new Combo({
      title: `Color Modes`,
      items: this.full_modes,
      value: this.mode,
      element: color,
      default: this.default_mode,
      action: (value) => {
        this.change(value)
      },
      get: () => {
        return this.mode
      },
      extra_title: `Ctrl Left/Right to cycle`,
    })

    this.make_alpha(this.alpha_0, `0.055`)
    this.make_alpha(this.alpha_1, `0.18`)
    this.make_alpha(this.alpha_2, `0.5`)

    this.apply()
  }

  static make_alpha(obj, a) {
    for (let color in this.colors) {
      let numbers = this.colors[color].match(/\d+/g)
      let rgba = `rgba(${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${a})`
      obj[color] = rgba
    }
  }

  static set_value(value) {
    if (this.mode === value) {
      return
    }

    this.combo.set_value(value)
  }

  static change(value) {
    if (this.mode === value) {
      return
    }

    this.mode = value
    Utils.save(this.ls_name, value)
    this.apply()
    Items.reset()
    Container.show_loading()
    Infobar.hide()
    Update.update()
  }

  static load_color() {
    return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
  }

  static apply() {
    let normal = this.colors[this.mode]

    let alpha_0 = this.alpha_0[this.mode]
    let alpha_1 = this.alpha_1[this.mode]
    let alpha_2 = this.alpha_2[this.mode]
    let background

    if (App.colorlib.is_dark(normal)) {
      background = `#ffffff`
    }
    else {
      background = `#000000`
    }

    document.documentElement.style.setProperty(`--color`, normal)
    document.documentElement.style.setProperty(`--color_alpha_0`, alpha_0)
    document.documentElement.style.setProperty(`--color_alpha_1`, alpha_1)
    document.documentElement.style.setProperty(`--color_alpha_2`, alpha_2)
    document.documentElement.style.setProperty(`--background`, background)

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

    Utils.context({items, e})
  }

  static do_move(color, curls) {
    let current = Curls.get_curls()
    let cleaned = []

    for (let curl of current) {
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
    Curls.save_curls(cleaned)
    let new_curls = Curls.get_curls(color)

    for (let curl of curls) {
      if (new_curls.includes(curl)) {
        continue
      }

      new_curls.unshift(curl)
    }

    Curls.save_curls(new_curls, color)
    Container.update()
  }

  static prev() {
    let index = this.modes.findIndex(x => x.value === this.mode)
    let prev = index - 1

    if (prev < 0) {
      prev = this.modes.length - 1
    }

    let value = this.modes[prev].value
    this.set_value(value)
  }

  static next() {
    let index = this.modes.findIndex(x => x.value === this.mode)
    let next = index + 1

    if (next >= this.modes.length) {
      next = 0
    }

    let value = this.modes[next].value
    this.set_value(value)
  }
}