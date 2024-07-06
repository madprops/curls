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

    static deselect() {
        window.getSelection().removeAllRanges()
    }

    static plural(n, singular, plural) {
        if (n === 1) {
            return singular
        }
        else {
            return plural
        }
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

    static sanitize(s) {
        return s.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
    }

    static urlize(el) {
        let html = el.innerHTML
        let urlRegex = /(https?:\/\/[^\s]+)/g
        let replacedText = html.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`)
        el.innerHTML = replacedText
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
        else {
            return `up`
        }
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
        return modes.filter(x => x.value !== App.separator)
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
            block: `center`,
        }

        if (!args.item) {
            return
        }

        this.def_args(def_args, args)
        args.item.scrollIntoView({ behavior: args.behavior, block: args.block })
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

    static load_array(name) {
        return localStorage.getItem(name) || `[]`
    }

    static load_string(name, def_value = ``) {
        return localStorage.getItem(name) || def_value
    }

    static save(name, value) {
        localStorage.setItem(name, value)
    }
}