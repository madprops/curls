App.remove_a_curl = () => {
    App.prompt({title: `Remove Curl`, callback: (value) => {
        App.remove_a_curl_submit(value)
    }, message: `Enter the curl to remove`})
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
    let now = App.now()
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

App.do_remove_curl = (curl, remove_item = true) => {
    let curls = App.get_curls()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    App.save_curls(cleaned)
    Curlist.update()

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
    let s = App.plural(removed.length, `Curl`, `Curls`)
    let curls = removed.join(`, `)

    App.confirm({title: `Remove ${removed.length} ${s}`, ok: () => {
        App.save_curls(cleaned)
        Curlist.update()
        App.remove_items(removed)
        App.hide_peek()
    }, message: curls})
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

App.remove_selected_curls = () => {
    let curls = Curlist.get_selected_curls()
    App.remove_curls(curls)
}

App.remove_all_curls = () => {
    App.confirm({title: `Remove All Curls`, ok: () => {
        App.clear_curls()
        Curlist.update()
        App.empty_container()
        App.hide_peek()
    }, message: `Remove all curls in the current color`})
}

App.remove_curls = (curls) => {
    let cleaned = []
    let removed = []

    for (let curl of App.get_curls()) {
        if (!curls.includes(curl)) {
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

App.remove_curl_item = (curl) => {
    let cleaned = []

    for (let item of App.items) {
        if (item.curl !== curl) {
            cleaned.push(item)
        }
    }

    App.items = cleaned
}

App.clear_all_curls = () => {
    App.confirm({title: `Clear Curls`, ok: () => {
        for (let color in App.colors) {
            App.clear_curls(color)
        }

        Curlist.update()
        App.empty_container()
    }, message: `Remove all curls in all colors`})
}