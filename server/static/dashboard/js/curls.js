App.get_used_curls = () => {
    let curls = App.get_curls()

    if (!curls.length) {
        return []
    }

    let used_curls = []

    for (let curl of curls) {
        if (used_curls.length > App.max_curls) {
            break
        }

        curl = curl.trim()

        if (!curl) {
            continue
        }

        if (curl.includes(` `)) {
            continue
        }

        if (curl.length > App.curl_max_length) {
            continue
        }

        if (used_curls.includes(curl)) {
            continue
        }

        used_curls.push(curl)
    }

    return used_curls
}

App.get_curls = () => {
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)
    return lines
}

App.do_add_curl = (where, curl = ``, update = true) => {
    if (!curl) {
        curl = prompt(`Add a curl:`)

        if (!curl) {
            return
        }
    }

    let curlist = DOM.el(`#curlist`)

    if (where === `top`) {
        curlist.value = `${curl}\n${curlist.value}`
    }
    else if (where === `bottom`) {
        curlist.value += `\n${curl}`
    }

    App.clean_curlist()

    if (App.save_curlist()) {
        if (update) {
            App.update(true)
        }
    }
}

App.save_cleaned = (cleaned, removed) => {
    let s = App.plural(removed.length, `item`, `items`)

    if (confirm(`Remove ${removed.length} ${s}?`)) {
        curlist.value = cleaned.join(`\n`)
        App.clean_curlist()

        if (App.save_curlist()) {
            App.update(true)
        }
    }
}

App.add_owned_curl = (curl) => {
    let curls = App.get_curls()

    if (!curls.includes(curl)) {
        App.do_add_curl(`top`, curl)
    }
}

App.copy_item = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    let status = item.querySelector(`.item_status`).textContent
    let updated = item.querySelector(`.item_updated`).textContent
    let msg = `${curl}\n${status}\n${updated}`
    navigator.clipboard.writeText(msg)

    let icon = item.querySelector(`.item_icon`)
    icon.classList.add(`blink`)

    setTimeout(() => {
        icon.classList.remove(`blink`)
    }, 1000)
}

App.setup_container = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        let icon = e.target.closest(`.item_icon`)

        if (icon) {
            App.show_item_menu(e)
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        let icon = e.target.closest(`.item_icon`)

        if (icon) {
            e.preventDefault()
            App.show_item_menu(e)
        }
    })
}

App.curl_to_top = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`top`, curl, false)

    if (App.get_sort() === `order`) {
        App.item_to_top(curl)
    }
}

App.curl_to_bottom = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`bottom`, curl, false)

    if (App.get_sort() === `order`) {
        App.item_to_bottom(curl)
    }
}

App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    DOM.ev(sort, `change`, () => {
        App.change_sort()
    })

    let saved = localStorage.getItem(`sort`) || `recent`
    sort.value = saved
}

App.change_sort = () => {
    let mode = App.get_sort()
    localStorage.setItem(`sort`, mode)
    App.update(true)
}

App.get_missing = () => {
    let used = App.last_used_curls
    let items = App.last_items
    return used.filter(curl => !items.find(item => item.curl === curl))
}