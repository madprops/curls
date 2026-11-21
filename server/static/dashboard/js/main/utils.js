/*

These are some utility functions

*/

class Utils {
  static console_logs = true
  static SECOND = 1000
  static MINUTE = this.SECOND * 60
  static HOUR = this.MINUTE * 60
  static DAY = this.HOUR * 24
  static WEEK = this.DAY * 7
  static MONTH = this.DAY * 30
  static YEAR = this.DAY * 365
  static scroll_wheel_step = 25

  static network = `🛜`
  static separator = `__separator__`
  static curl_too_long = `Curl is too long`
  static key_too_long = `Key is too long`
  static status_too_long = `Status is too long`

  static deselect() {
    window.getSelection().removeAllRanges()
  }

  static plural(n, singular, plural) {
    if (n === 1) {
      return singular
    }

    return plural
  }

  static info(msg) {
    if (this.console_logs) {
      // eslint-disable-next-line no-console
      console.info(`💡 ${msg}`)
    }
  }

  static error(msg) {
    if (this.console_logs) {
      // eslint-disable-next-line no-console
      console.info(`❌ ${msg}`)
    }
  }

  // Security: Escape all HTML-significant characters for safe text handling.
  static sanitize(s) {
    return String(s ?? ``)
      .replace(/&/g, `&amp;`)
      .replace(/</g, `&lt;`)
      .replace(/>/g, `&gt;`)
      .replace(/"/g, `&quot;`)
      .replace(/'/g, `&#39;`)
  }

  // Security: Build status text and clickable links using DOM nodes instead of innerHTML
  // regex replacement, preventing attribute-breakout Stored XSS via quotes inside URLs.
  static urlize(el, text) {
    let content = String(text ?? ``)
    let urlRegex = /https?:\/\/[^\s"'<>]+/g
    let fragment = document.createDocumentFragment()
    let lastIndex = 0
    let match

    while ((match = urlRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        fragment.append(document.createTextNode(content.slice(lastIndex, match.index)))
      }

      let rawUrl = match[0]
      let parsed = null

      try {
        parsed = new URL(rawUrl)
      }
      catch {
        parsed = null
      }

      // Security: Only allow http/https URLs; never create links for javascript: or data: URIs.
      if (parsed && ((parsed.protocol === `http:`) || (parsed.protocol === `https:`))) {
        let link = document.createElement(`a`)
        link.href = parsed.href
        link.textContent = rawUrl
        link.target = `_blank`
        // Security: Prevent reverse tabnabbing and referrer leakage on external links.
        link.rel = `noopener noreferrer`
        fragment.append(link)
      }
      else {
        fragment.append(document.createTextNode(rawUrl))
      }

      lastIndex = urlRegex.lastIndex
    }

    if (lastIndex < content.length) {
      fragment.append(document.createTextNode(content.slice(lastIndex)))
    }

    el.replaceChildren(fragment)
  }

  static create_debouncer(func, delay) {
    if (typeof func !== `function`) {
      this.error(`Invalid debouncer function`)
      return
    }

    if (!delay) {
      this.error(`Invalid debouncer delay`)
      return
    }

    let timer
    let obj = {}

    let clear = () => {
      clearTimeout(timer)
    }

    let run = (...args) => {
      func(...args)
    }

    obj.call = (...args) => {
      clear()

      timer = setTimeout(() => {
        run(...args)
      }, delay)
    }

    obj.now = (...args) => {
      clear()
      run(...args)
    }

    obj.cancel = () => {
      clear()
    }

    return obj
  }

  static wheel_direction(e) {
    if (e.deltaY > 0) {
      return `down`
    }

    return `up`
  }

  static capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  static now() {
    return Date.now()
  }

  static copy_to_clipboard(text) {
    navigator.clipboard.writeText(text)
  }

  static smart_list(string) {
    return string.split(/[\s,;]+/).filter(Boolean)
  }

  static clean_modes(modes) {
    return modes.filter(x => x.value !== Utils.separator)
  }

  static def_args(def, args) {
    for (let key in def) {
      if ((args[key] === undefined) && (def[key] !== undefined)) {
        args[key] = def[key]
      }
    }
  }

  static scroll_element(args = {}) {
    let def_args = {
      behavior: `instant`,
      block: `nearest`,
    }

    if (!args.item) {
      return
    }

    this.def_args(def_args, args)
    args.item.scrollIntoView({behavior: args.behavior, block: args.block})
    window.scrollTo(0, window.scrollY)
  }

  static last(list) {
    return list.slice(-1)[0]
  }

  static load_modes(name, modes, def_value) {
    let saved = localStorage.getItem(name) || def_value
    let values = this.clean_modes(modes).map(x => x.value)

    if (!values.includes(saved)) {
      saved = def_value
    }

    return saved
  }

  static load_boolean(name, positive = true) {
    let value = positive ? `true` : `false`
    let saved = localStorage.getItem(name) || value
    return saved === `true`
  }

  // Security: Always verify parsed storage JSON is an array so corrupted data cannot crash startup.
  static load_array(name) {
    try {
      let parsed = JSON.parse(localStorage.getItem(name) || `[]`)
      return Array.isArray(parsed) ? parsed : []
    }
    catch (err) {
      this.error(err)
      return []
    }
  }

  // Security: Session-only storage helper for sensitive data (cleared when the browser tab closes).
  static load_session_array(name) {
    try {
      let parsed = JSON.parse(sessionStorage.getItem(name) || `[]`)
      return Array.isArray(parsed) ? parsed : []
    }
    catch (err) {
      this.error(err)
      return []
    }
  }

  static save_session(name, value) {
    sessionStorage.setItem(name, value)
  }

  static load_string(name, def_value = ``) {
    return localStorage.getItem(name) || def_value
  }

  static save(name, value) {
    localStorage.setItem(name, value)
  }

  static context(args) {
    let def_args = {
      focus: true,
    }

    this.def_args(def_args, args)

    if (args.focus) {
      args.after_hide = () => {
        if (args.input) {
          args.input.focus()
        }
        else {
          Container.focus()
        }
      }
    }

    NeedContext.show({
      e: args.e,
      items: args.items,
      element: args.element,
      after_hide: args.after_hide,
    })
  }

  static timeago = (date) => {
    let diff = this.now() - date
    let decimals = true

    let n = 0
    let m = ``

    if (diff < this.SECOND) {
      return `Just Now`
    }
    else if (diff < this.MINUTE) {
      n = diff / this.SECOND
      m = [`second`, `seconds`]
      decimals = false
    }
    else if (diff < this.HOUR) {
      n = diff / this.MINUTE
      m = [`minute`, `minutes`]
      decimals = false
    }
    else if ((diff >= this.HOUR) && (diff < this.DAY)) {
      n = diff / this.HOUR
      m = [`hour`, `hours`]
    }
    else if ((diff >= this.DAY) && (diff < this.MONTH)) {
      n = diff / this.DAY
      m = [`day`, `days`]
    }
    else if ((diff >= this.MONTH) && (diff < this.YEAR)) {
      n = diff / this.MONTH
      m = [`month`, `months`]
    }
    else if (diff >= this.YEAR) {
      n = diff / this.YEAR
      m = [`year`, `years`]
    }

    if (decimals) {
      n = this.round(n, 1)
    }
    else {
      n = Math.round(n)
    }

    let w = this.plural(n, m[0], m[1])
    return `${n} ${w} ago`
  }

  static round = (n, decimals) => {
    return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }

  static find_item(items, key, value) {
    return items.find(x => x[key] === value)
  }

  static scroll_wheel(e) {
    let direction = this.wheel_direction(e)

    if (direction === `up`) {
      e.target.scrollLeft -= this.scroll_wheel_step
    }
    else {
      e.target.scrollLeft += this.scroll_wheel_step
    }
  }
}