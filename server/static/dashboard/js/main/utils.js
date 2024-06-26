App.unselect = () => {
    window.getSelection().removeAllRanges()
}

App.plural = (n, singular, plural) => {
    if (n === 1) {
        return singular
    }
    else {
        return plural
    }
}

App.info = (msg) => {
    if (App.console_logs) {
        // eslint-disable-next-line no-console
        console.info(`💡 ${msg}`)
    }
}

App.error = (msg) => {
    if (App.console_logs) {
        // eslint-disable-next-line no-console
        console.info(`❌ ${msg}`)
    }
}

App.sanitize = (s) => {
    return s.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
}

App.urlize = (el) => {
    let html = el.innerHTML
    let urlRegex = /(https?:\/\/[^\s]+)/g
    let replacedText = html.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`)
    el.innerHTML = replacedText
}

App.get_url = (curl) => {
    return `/${curl}`
}

App.create_debouncer = (func, delay) => {
    if (typeof func !== `function`) {
        App.error(`Invalid debouncer function`)
        return
    }

    if (!delay) {
        App.error(`Invalid debouncer delay`)
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

App.switch_state = (current, list, reverse = false) => {
    let index = list.indexOf(current);

    if (index === -1) {
        throw new Error(`Invalid state: ${current}`);
    }

    if (reverse) {
        return list[(index - 1 + list.length) % list.length];
    } else {
        return list[(index + 1) % list.length] || list[1];
    }
}

App.wheel_direction = (e) => {
    if (e.deltaY > 0) {
        return `down`
    }
    else {
        return `up`
    }
}

App.capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

App.now = () => {
    return Date.now()
}