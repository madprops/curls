/*

The picker stores owned curls

*/

class Picker {
  static max_items = 1000
  static ls_name = `picker`

  static setup() {
    let picker = DOM.el(`#picker`)

    DOM.ev(picker, `click`, (e) => {
      this.show(e)
    })

    let items = this.get_items()

    if (items.length) {
      let first = items[0]
      DOM.el(`#change_curl`).value = first.curl
      DOM.el(`#change_key`).value = first.key
    }

    let curl = DOM.el(`#change_curl`)

    DOM.ev(curl, `keydown`, (e) => {
      if ((e.key === `ArrowUp`) || (e.key === `ArrowDown`)) {
        e.preventDefault()
      }
    })

    DOM.ev(curl, `keyup`, (e) => {
      if ((e.key === `ArrowUp`) || (e.key === `ArrowDown`)) {
        this.show(e)
        e.preventDefault()
      }
    })
  }

  static get_items() {
    return Utils.load_array(this.ls_name)
  }

  static add() {
    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let cleaned = [{curl, key}]

    for (let item of this.get_items()) {
      if (item.curl === curl) {
        continue
      }

      cleaned.push(item)

      if (cleaned.length >= this.max_items) {
        break
      }
    }

    Utils.save(this.ls_name, JSON.stringify(cleaned))
  }

  static show(e) {
    let items = []
    let picker_items = this.get_items()

    if (!picker_items.length) {
      items.push({
        text: `Import`,
        action: () => {
          this.import()
        },
      })
    }
    else {
      for (let item of picker_items) {
        items.push({
          text: item.curl,
          action: () => {
            let curl = DOM.el(`#change_curl`)
            let key = DOM.el(`#change_key`)
            curl.value = item.curl
            key.value = item.key
            curl.focus()
            this.add()
          },
          alt_action: () => {
            this.remove_item(item.curl)
          },
        })
      }

      if (items.length) {
        items.push({
          separator: true,
        })
      }

      items.push({
        text: `Export`,
        action: () => {
          this.export()
        },
      })

      items.push({
        text: `Import`,
        action: () => {
          this.import()
        },
      })
    }

    let el = DOM.el(`#picker`)
    Utils.context({items, element: el, e})
  }

  static export() {
    Windows.alert_export(this.get_items())
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
      let items = JSON.parse(data)
      Utils.save(this.ls_name, JSON.stringify(items))
    }
    catch (err) {
      Utils.error(err)
      Windows.alert({title: `Error`, message: err})
    }
  }

  static remove_item(curl) {
    Windows.confirm({title: `Remove Picker Item`, ok: () => {
      this.do_remove_item(curl)
    }, message: curl})
  }

  static do_remove_item(curl) {
    let cleaned = []

    for (let item of this.get_items()) {
      if (item.curl === curl) {
        continue
      }

      cleaned.push(item)
    }

    Utils.save(this.ls_name, JSON.stringify(cleaned))
  }
}