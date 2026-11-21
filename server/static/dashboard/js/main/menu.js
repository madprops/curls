class Menu {
  static setup() {
    let menu = DOM.el(`#menu`)

    DOM.ev(menu, `click`, (e) => {
      this.show(e)
    })
  }

  static show(e) {
    let curls = Curls.get_curls()
    let items

    let data = [
      {
        separator: true,
      },
      {
        text: `Export`,
        action: (e) => {
          this.export(e)
        },
      },
      {
        text: `Import`,
        action: () => {
          this.import()
        },
      },
    ]

    if (curls.length) {
      items = [
        {
          text: `Add`,
          action: () => {
            Curls.add()
          },
        },
        {
          separator: true,
        },
        {
          text: `Copy`,
          action: () => {
            Curls.copy()
          },
        },
        {
          text: `Replace`,
          action: () => {
            Curls.replace()
          },
        },
        {
          text: `Remove`,
          action: (e) => {
            Curls.show_remove_menu(e)
          },
        },
        ...data,
      ]
    }
    else {
      items = [
        {
          text: `Add`,
          action: () => {
            Curls.add()
          },
        },
        ...data,
      ]
    }

    items.push({
      separator: true,
    })

    items.push({
      text: `Claim`,
      action: () => {
        this.claim()
      },
    })

    Utils.context({items, e})
  }

  static export() {
    let colors = {}

    for (let color in Colors.colors) {
      let curls = Curls.get_curls(color)

      if (!curls.length) {
        continue
      }

      colors[color] = curls
    }

    if (!Object.keys(colors).length) {
      Windows.alert({message: `No curls to export`})
      return
    }

    Windows.alert_export(colors)
  }

  static import() {
    Windows.prompt({title: `Paste Data`, callback: (value) => {
      this.import_submit(value)
    }, message: `You get this data in Export`})
  }

  static import_submit(data) {
    if (!data) {
      return
    }

    try {
      let colors = JSON.parse(data)

      // Security: Require a plain JSON object to prevent malformed or prototype-polluting imports.
      if (!colors || (typeof colors !== `object`) || Array.isArray(colors)) {
        Windows.alert({title: `Error`, message: `Invalid import data format`})
        return
      }

      let modified = false

      for (let color of Object.keys(colors)) {
        // Security: Only accept known color profiles so arbitrary localStorage keys cannot be written.
        if (!Object.hasOwn(Colors.colors, color)) {
          continue
        }

        let raw_curls = colors[color]

        if (!Array.isArray(raw_curls)) {
          continue
        }

        let curls = raw_curls
          .filter(x => typeof x === `string`)
          .map(x => x.trim().toLowerCase())
          .filter(x => Curls.check(x))

        if (!curls.length) {
          continue
        }

        Curls.clear(color)
        Curls.save_curls(curls, color)
        modified = true
      }

      if (!modified) {
        Windows.alert({message: `No curls to import`})
        return
      }

      Update.update()
    }
    catch (err) {
      Utils.error(err)
      Windows.alert({title: `Error`, message: err})
    }
  }

  static claim() {
    window.open(`/claim`, `_blank`)
  }
}