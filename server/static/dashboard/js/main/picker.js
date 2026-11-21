/*

The picker stores owned curls

*/

class Picker {
  static max_items = 1000
  // Legacy localStorage key (migrated and scrubbed so plaintext secret keys do not persist on disk).
  static ls_legacy_name = `picker`
  // Persistent localStorage stores only non-secret owned curl names.
  static ls_curls_name = `picker_curls`
  // Security: Secret keys are kept in sessionStorage only so they clear when the tab closes.
  static ss_name = `picker_session`

  static setup() {
    this.migrate_legacy()
    let picker = DOM.el(`#picker`)

    DOM.ev(picker, `click`, (e) => {
      this.show(e)
    })

    let items = this.get_items()

    if (items.length) {
      let first = items[0]
      DOM.el(`#change_curl`).value = first.curl
      // Security: Do not auto-populate #change_key on page load; wait for explicit user selection.
      DOM.el(`#change_key`).value = ``
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

  // Security: Move any legacy plaintext keys out of localStorage into sessionStorage and scrub disk storage.
  static migrate_legacy() {
    let raw = localStorage.getItem(this.ls_legacy_name)

    if (!raw) {
      return
    }

    try {
      let parsed = JSON.parse(raw)
      let valid = this.sanitize_items(parsed)

      if (valid.length && !Utils.load_session_array(this.ss_name).length) {
        this.save_items(valid)
      }
    }
    catch (err) {
      Utils.error(err)
    }

    localStorage.removeItem(this.ls_legacy_name)
  }

  // Security: Validate and normalize picker entries so malformed JSON imports cannot brick the dashboard.
  static sanitize_items(items) {
    if (!Array.isArray(items)) {
      return []
    }

    let cleaned = []
    let seen = new Set()

    for (let item of items) {
      if (!item || (typeof item !== `object`)) {
        continue
      }

      if (typeof item.curl !== `string`) {
        continue
      }

      let curl = item.curl.trim().toLowerCase()

      if (!Curls.check(curl) || seen.has(curl)) {
        continue
      }

      let key = typeof item.key === `string` ? item.key.trim() : ``

      if (key.length > Change.key_length) {
        continue
      }

      seen.add(curl)
      cleaned.push({curl, key})

      if (cleaned.length >= this.max_items) {
        break
      }
    }

    return cleaned
  }

  static save_items(items) {
    let cleaned = this.sanitize_items(items)
    let session_items = cleaned.filter(item => item.key)
    let curl_names = cleaned.map(item => item.curl)
    Utils.save_session(this.ss_name, JSON.stringify(session_items))
    Utils.save(this.ls_curls_name, JSON.stringify(curl_names))
  }

  static get_items() {
    let session_items = this.sanitize_items(Utils.load_session_array(this.ss_name))
    let saved_names = Utils.load_array(this.ls_curls_name)
    let key_map = new Map(session_items.map(item => [item.curl, item.key]))
    let merged = []
    let seen = new Set()

    for (let item of session_items) {
      seen.add(item.curl)
      merged.push(item)
    }

    for (let name of saved_names) {
      if (typeof name !== `string`) {
        continue
      }

      let curl = name.trim().toLowerCase()

      if (!Curls.check(curl) || seen.has(curl)) {
        continue
      }

      seen.add(curl)
      merged.push({curl, key: key_map.get(curl) || ``})

      if (merged.length >= this.max_items) {
        break
      }
    }

    return merged
  }

  static add() {
    let curl = DOM.el(`#change_curl`).value.trim().toLowerCase()
    let key = DOM.el(`#change_key`).value.trim()

    if (!Curls.check(curl)) {
      return
    }

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

    this.save_items(cleaned)
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

            if (item.key) {
              curl.focus()
            }
            else {
              key.focus()
            }

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
      let parsed = JSON.parse(data)

      // Security: Require a valid array of {curl, key} entries before overwriting picker state.
      if (!Array.isArray(parsed)) {
        Windows.alert({title: `Error`, message: `Invalid picker data format`})
        return
      }

      let valid = this.sanitize_items(parsed)

      if (!valid.length) {
        Windows.alert({title: `Error`, message: `No valid picker items found`})
        return
      }

      this.save_items(valid)
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

    this.save_items(cleaned)
  }
}