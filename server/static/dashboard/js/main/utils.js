/*

These are some utility functions

*/

const Utils = {
    console_logs: true,
}

Utils.deselect = () => {
    window.getSelection().removeAllRanges()
}

Utils.plural = (n, singular, plural) => {
    if (n === 1) {
        return singular
    }
    else {
        return plural
    }
}

Utils.info = (msg) => {
    if (Utils.console_logs) {
        // eslint-disable-next-line no-console
        console.info(`💡 ${msg}`)
    }
}

Utils.error = (msg) => {
    if (Utils.console_logs) {
        // eslint-disable-next-line no-console
        console.info(`❌ ${msg}`)
    }
}

Utils.sanitize = (s) => {
    return s.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
}

Utils.urlize = (el) => {
    let html = el.innerHTML
    let urlRegex = /(https?:\/\/[^\s]+)/g
    let replacedText = html.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`)
    el.innerHTML = replacedText
}

Utils.create_debouncer = (func, delay) => {
    if (typeof func !== `function`) {
        Utils.error(`Invalid debouncer function`)
        return
    }

    if (!delay) {
        Utils.error(`Invalid debouncer delay`)
        return
    }

    let timer
    let obj = {}

    function clear() {
        clearTimeout(timer)
    }

    function run(...args) {
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

Utils.wheel_direction = (e) => {
    if (e.deltaY > 0) {
        return `down`
    }
    else {
        return `up`
    }
}

Utils.capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

Utils.now = () => {
    return Date.now()
}

Utils.copy_to_clipboard = (text) => {
    navigator.clipboard.writeText(text)
}

Utils.smart_list = (string) => {
    return string.split(/[\s,;]+/).filter(Boolean)
}

Utils.clean_modes = (modes) => {
    return modes.filter(x => x.value !== App.separator)
}

Utils.def_args = (def, args) => {
    for (let key in def) {
        if ((args[key] === undefined) && (def[key] !== undefined)) {
            args[key] = def[key]
        }
    }
}

Utils.scroll_element = (args = {}) => {
    let def_args = {
        behavior: `instant`,
        block: `center`,
    }

    if (!args.item) {
        return
    }

    Utils.def_args(def_args, args)
    args.item.scrollIntoView({ behavior: args.behavior, block: args.block })
    window.scrollTo(0, window.scrollY)
}

Utils.last = (list) => {
    return list.slice(-1)[0]
}

Utils.load_modes = (name, modes, def_value) => {
    let saved = localStorage.getItem(name) || def_value
    let values = Utils.clean_modes(modes).map(x => x.value)

    if (!values.includes(saved)) {
        saved = def_value
    }

    return saved
}

Utils.load_boolean = (name, positive = true) => {
    let value = positive ? `true` : `false`
    let saved = localStorage.getItem(name) || value
    return saved === `true`
}

Utils.load_array = (name) => {
    return localStorage.getItem(name) || `[]`
}

Utils.load_string = (name, def_value = ``) => {
    return localStorage.getItem(name) || def_value
}

Utils.save = (name, value) => {
    localStorage.setItem(name, value)
}