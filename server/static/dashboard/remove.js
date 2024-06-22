App.remove_a_curl = () => {
    let curl = prompt(`Remove a curl:`)

    if (!curl) {
        return
    }

    App.do_remove_curl(curl)
}

App.remove_not_found = () => {
    let missing = App.last_missing
    let curls = App.get_curls()
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
    let curls = App.get_curls()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = App.get_item(curl)

        if (!item) {
            continue
        }

        if (!item.original_status) {
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
    let curls = App.get_curls()
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
            let datetime = new Date(date + "Z").getTime()

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

App.do_remove_curl = (curl, update = true) => {
    let curls = App.get_curls()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    curlist.value = cleaned.join(`\n`)

    if (App.save_curlist()) {
        if (update) {
            App.update(true)
        }
    }
}