App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    let lines = [
        `Click to pick sort`,
        `Wheel to cycle sorts`,
        `Middle Click to reset`,
    ]

    sort.title = lines.join(`\n`)

    DOM.ev(sort, `change`, (e) => {
        App.change_sort(e.target.value)
    })

    DOM.ev(sort, `auxclick`, (e) => {
        if (e.button === 1) {
            App.reset_sort()
        }
    })

    DOM.ev(sort, `wheel`, (e) => {
        let direction = App.wheel_direction(e)
        App.cycle_sort(direction)
        e.preventDefault()
    })

    sort.value = App.load_sort()
}

App.change_sort = (value) => {
    localStorage.setItem(`sort`, value)
    App.refresh_items()
}

App.sort_if_order = () => {
    if (App.get_sort() == `order`) {
        App.refresh_items()
    }
}

App.sort_items = (items) => {
    let mode = App.get_sort()

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
    let defvalue = `newest`
    let saved = localStorage.getItem(`sort`) || defvalue
    let values = Array.from(sort.options).map(option => option.value)

    if (!values.includes(saved)) {
        saved = defvalue
    }

    return saved
}

App.get_sort = () => {
    return DOM.el(`#sort`).value
}

App.cycle_sort = (direction) => {
    let sort = DOM.el(`#sort`)

    let values = Array.from(sort.options)
    .filter(x => !x.disabled).map(option => option.value)

    let index = values.indexOf(sort.value)

    if (direction === `up`) {
        index--
    }
    else if (direction === `down`) {
        index++
    }

    if (index < 0) {
        index = values.length - 1
    }
    else if (index >= values.length) {
        index = 0
    }

    let new_value = values[index]
    sort.value = new_value
    App.change_sort(new_value)
}

App.reset_sort = () => {
    DOM.el(`#sort`).value = `newest`
    App.change_sort(`newest`)
}