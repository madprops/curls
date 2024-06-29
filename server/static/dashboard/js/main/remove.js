App.remove_a_curl = () => {
    App.prompt(`Remove a curl`, (value) => {
        App.remove_a_curl_submit(value)
    })
}

App.remove_a_curl_submit = (curl) => {
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
    App.confirm(`Remove ${curl}`, () => {
        App.do_remove_curl(curl)
    })
}

App.do_remove_curl = (curl, remove_item = true) => {
    let curls = App.get_curls()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    App.save_curls(cleaned)
    App.update_curlist()

    if (remove_item) {
        App.remove_item(curl)
    }

    if (App.peek_curl === curl) {
        App.hide_peek()
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
    let s = App.plural(removed.length, `curl`, `curls`)

    App.confirm(`Remove ${removed.length} ${s}`, () => {
        App.save_curls(cleaned)
        App.update_curlist()
        App.remove_items(removed)
    })
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
    App.confirm(`Remove all curls`, () => {
        App.clear_curls()
        App.update_curlist()
        App.empty_container()
    })
}

App.remove_selected_curls = () => {
    let selected = App.get_selected_curls()
    let cleaned = []
    let removed = []

    for (let curl of App.get_curls()) {
        if (!selected.includes(curl)) {
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