App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    let lines = [
        `Click to pick sort`,
        `Wheel to cycle sorts`,
        `Middle Click to reset`,
    ]

    sort.title = lines.join(`\n`)
    App.sort_mode = App.load_sort()

    Combo.register({
        items: App.sort_modes,
        value: App.sort_mode,
        element: sort,
        default: `newest`,
        action: (value) => {
            App.change_sort(value)
        },
        get: () => {
            return App.sort_mode
        },
    })
}

App.change_sort = (value) => {
    if (App.sort_mode === value) {
        return
    }

    App.sort_mode = value
    localStorage.setItem(`sort`, value)
    App.refresh_items()
}

App.sort_if_order = () => {
    if (App.sort_mode == `order`) {
        App.refresh_items()
    }
}

App.sort_items = (items) => {
    let mode = App.sort_mode

    if (mode === `order`) {
        let used_curls = App.get_used_curls()

        items.sort((a, b) => {
            return used_curls.indexOf(a.curl) - used_curls.indexOf(b.curl)
        })
    }
    else if (mode === `newest`) {
        items.sort((a, b) => {
            let compare = b.updated.localeCompare(a.updated)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `oldest`) {
        items.sort((a, b) => {
            let compare = a.updated.localeCompare(b.updated)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `curl_asc`) {
        items.sort((a, b) => {
            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `curl_desc`) {
        items.sort((a, b) => {
            return b.curl.localeCompare(a.curl)
        })
    }
    else if (mode === `status_asc`) {
        items.sort((a, b) => {
            let compare = a.status.localeCompare(b.status)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `status_desc`) {
        items.sort((a, b) => {
            let compare = b.status.localeCompare(a.status)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `short_curl`) {
        items.sort((a, b) => {
            let diff = a.curl.length - b.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `long_curl`) {
        items.sort((a, b) => {
            let diff = b.curl.length - a.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `short_status`) {
        items.sort((a, b) => {
            let diff = a.status.length - b.status.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `long_status`) {
        items.sort((a, b) => {
            let diff = b.status.length - a.status.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
}

App.load_sort = () => {
    let def_mode = `newest`
    let mode = localStorage.getItem(`sort`) || def_mode
    let modes = App.sort_modes.map(x => x.mode)

    if (!modes.includes(mode)) {
        mode = def_mode
    }

    return mode
}