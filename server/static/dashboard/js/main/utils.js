/*

These are some utility functions

*/

class UtilsClass {
    constructor() {
        this.console_logs = true
    }

    deselect () {
        window.getSelection().removeAllRanges()
    }

    plural (n, singular, plural) {
        if (n === 1) {
            return singular
        }
        else {
            return plural
        }
    }

    info (msg) {
        if (this.console_logs) {
            // eslint-disable-next-line no-console
            console.info(`💡 ${msg}`)
        }
    }

    error (msg) {
        if (this.console_logs) {
            // eslint-disable-next-line no-console
            console.info(`❌ ${msg}`)
        }
    }

    sanitize (s) {
        return s.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
    }

    urlize (el) {
        let html = el.innerHTML
        let urlRegex = /(https?:\/\/[^\s]+)/g
        let replacedText = html.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`)
        el.innerHTML = replacedText
    }

    create_debouncer (func, delay) {
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

    wheel_direction (e) {
        if (e.deltaY > 0) {
            return `down`
        }
        else {
            return `up`
        }
    }

    capitalize (s) {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    now () {
        return Date.now()
    }

    copy_to_clipboard (text) {
        navigator.clipboard.writeText(text)
    }

    smart_list (string) {
        return string.split(/[\s,;]+/).filter(Boolean)
    }

    clean_modes (modes) {
        return modes.filter(x => x.value !== App.separator)
    }

    def_args (def, args) {
        for (let key in def) {
            if ((args[key] === undefined) && (def[key] !== undefined)) {
                args[key] = def[key]
            }
        }
    }

    scroll_element (args = {}) {
        let def_args = {
            behavior: `instant`,
            block: `center`,
        }

        if (!args.item) {
            return
        }

        this.def_args(def_args, args)
        args.item.scrollIntoView({ behavior: args.behavior, block: args.block })
        window.scrollTo(0, window.scrollY)
    }

    last (list) {
        return list.slice(-1)[0]
    }

    load_modes (name, modes, def_value) {
        let saved = localStorage.getItem(name) || def_value
        let values = this.clean_modes(modes).map(x => x.value)

        if (!values.includes(saved)) {
            saved = def_value
        }

        return saved
    }

    load_boolean (name, positive = true) {
        let value = positive ? `true` : `false`
        let saved = localStorage.getItem(name) || value
        return saved === `true`
    }

    load_array (name) {
        return localStorage.getItem(name) || `[]`
    }

    load_string (name, def_value = ``) {
        return localStorage.getItem(name) || def_value
    }

    save (name, value) {
        localStorage.setItem(name, value)
    }
}

const Utils = new UtilsClass()