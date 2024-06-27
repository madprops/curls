App.remove_a_curl = () => {
    let curl = prompt(`Remove a curl`)

    if (!curl) {
        return
    }

    App.do_remove_curl(curl)
}

App.remove_not_found = () => {
    let missing = App.get_missing_items().map(x => x.curl)
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
            let datetime = new Date(date + `Z`).getTime()

            if ((now - datetime) > (App.old_delay)) {
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

App.remove_curl = (curl) => {
    if (confirm(`Remove ${curl}?`)) {
        App.do_remove_curl(curl)
    }
}

App.do_remove_curl = (curl, remove_item = true) => {
    let curls = App.get_curls()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    App.save_curls(App.color_mode, cleaned)
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
        App.save_curls(App.color_mode, cleaned)
        App.update_curlist()
        App.remove_items(removed)
    }
}

App.show_remove_menu = (e) => {
    let items = [
        {
            text: `Remove One`,
            action: () => {
                App.remove_a_curl()
            }
        },
        {
            text: `Remove Not Found`,
            action: () => {
                App.remove_not_found()
            }
        },
        {
            text: `Remove Empty`,
            action: () => {
                App.remove_empty()
            }
        },
        {
            text: `Remove Old`,
            action: () => {
                App.remove_old()
            }
        },
        {
            text: `Remove All`,
            action: () => {
                App.remove_all_curls()
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.remove_all_curls = () => {
    let length = App.get_curls().length

    if (confirm(`Remove all curls? (${length})`)) {
        App.clear_curls()
        App.update_curlist()
        App.empty_container()
    }
}