App.remove_a_curl = () => {
    let curl = prompt(`Remove a curl:`)

    if (!curl) {
        return
    }

    App.do_remove_curl(curl)
}

App.remove_not_found = () => {
    let missing = App.get_missing_items().map(x => x.curl)
    let curls = App.get_curls_by_color()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        if (!missing.includes(curl)) {
            cleaned.push(curl)
        }
        else {
            removed.push(curl)
        }
    }

    if (!removed.length) {
        return
    }

    App.save_cleaned(cleaned, removed)
}

App.remove_empty = () => {
    let curls = App.get_curls_by_color()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = App.get_item(curl)

        if (!item) {
            continue
        }

        if (!item.status) {
            removed.push(curl)
            continue
        }

        cleaned.push(curl)
    }

    if (!removed.length) {
        return
    }

    App.save_cleaned(cleaned, removed)
}

App.remove_old = () => {
    let curls = App.get_curls_by_color()
    let now = Date.now()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = App.get_item(curl)

        if (!item) {
            continue
        }

        let date = item.updated

        if (date) {
            let datetime = new Date(date + `Z`).getTime()

            if ((now - datetime) > (App.YEAR * 1)) {
                removed.push(curl)
                continue
            }
        }

        cleaned.push(curl)
    }

    if (!removed.length) {
        return
    }

    App.save_cleaned(cleaned, removed)
}

App.remove_curl = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent

    if (confirm(`Remove ${curl}?`)) {
        App.do_remove_curl(curl)
    }
}

App.do_remove_curl = (curl, remove_item = true) => {
    let curls = App.get_curls_by_color()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    App.save_curls()
    App.update_curlist()

    if (remove_item) {
        App.remove_item(curl)
    }
}

App.remove_item = (curl) => {
    App.remove_items([curl])
}

App.remove_items = (removed) => {
    for (let curl of removed) {
        let item = App.get_item(curl)
        let el = item.element

        if (el) {
            el.remove()
        }

        let index = App.items.indexOf(item)
        App.items.splice(index, 1)
    }

    App.check_empty()
}

App.save_cleaned = (cleaned, removed) => {
    let s = App.plural(removed.length, `item`, `items`)

    if (confirm(`Remove ${removed.length} ${s}?`)) {
        App.save_curls()
        App.update_curlist()
        App.remove_items(removed)
    }
}