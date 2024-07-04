App.setup_sort = () => {
    let sort = DOM.el(`#sort`)
    App.sort_mode = App.load_sort()

    Combo.register({
        title: `Sort Modes`,
        items: App.sort_modes,
        value: App.sort_mode,
        element: sort,
        default: App.default_sort,
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
    App.update_items()
}

App.sort_if_order = () => {
    if (App.sort_mode == `order`) {
        App.update_items()
    }
}

App.sort_items = (items) => {
    let mode = App.sort_mode

    if (mode === `order`) {
        let curls = App.get_curls()

        items.sort((a, b) => {
            return curls.indexOf(a.curl) - curls.indexOf(b.curl)
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
    else if (mode === `curl_short`) {
        items.sort((a, b) => {
            let diff = a.curl.length - b.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `curl_long`) {
        items.sort((a, b) => {
            let diff = b.curl.length - a.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `status_short`) {
        items.sort((a, b) => {
            let diff = a.status.length - b.status.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `status_long`) {
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
    return App.load_modes(`sort`, App.sort_modes, App.default_sort)
}