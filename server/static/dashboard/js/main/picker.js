App.setup_picker = () => {
    let picker = DOM.el(`#picker`)

    DOM.ev(picker, `click`, (e) => {
        App.show_picker(e)
    })

    let items = App.get_picker_items()

    if (items.length) {
        let first = items[0]
        DOM.el(`#change_curl`).value = first.curl
        DOM.el(`#change_key`).value = first.key
    }
}

App.get_picker_items = () => {
    let saved = localStorage.getItem(`picker`) || `[]`
    return JSON.parse(saved)
}

App.add_to_picker = () => {
    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let cleaned = [{curl, key}]

    for (let item of App.get_picker_items()) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)

        if (cleaned.length >= App.max_picker_items) {
            break
        }
    }

    localStorage.setItem(`picker`, JSON.stringify(cleaned))
}

App.show_picker = (e) => {
    let items = []
    let picker_items = App.get_picker_items()

    if (!picker_items.length) {
        items.push({
            text: `Import`,
            action: () => {
                App.import_pickers()
            },
        })
    }
    else {
        for (let item of picker_items) {
            items.push({
                text: item.curl,
                action: () => {
                    DOM.el(`#change_curl`).value = item.curl
                    DOM.el(`#change_key`).value = item.key
                    App.add_to_picker()
                },
                alt_action: () => {
                    App.remove_picker_item(item.curl)
                },
            })
        }

        if (items.length) {
            items.push({
                separator: true,
            })
        }

        items.push({
            text: `Export`,
            action: () => {
                App.export_pickers()
            },
        })

        items.push({
            text: `Import`,
            action: () => {
                App.import_pickers()
            },
        })

        items.push({
            text: `Clear`,
            action: () => {
                App.clear_picker()
            },
        })
    }

    NeedContext.show({items: items, e: e})
}

App.export_pickers = () => {
    App.alert_export(App.get_picker_items())
}

App.import_pickers = () => {
    App.prompt({title: `Paste Data`, callback: (value) => {
        App.import_pickers_submit(value)
    }, message: `You get this data in Export`})
}

App.import_pickers_submit = (data) => {
    if (!data) {
        return
    }

    try {
        let items = JSON.parse(data)
        localStorage.setItem(`picker`, JSON.stringify(items))
    }
    catch (err) {
        App.error(err)
        App.alert({title: `Error`, message: err})
    }
}

App.clear_picker = () => {
    App.confirm({title: `Clear Picker`, ok: () => {
        localStorage.setItem(`picker`, `[]`)
    }, message: `Remove all items from the picker`})
}

App.remove_picker_item = (curl) => {
    App.confirm({title: `Remove Picker Item`, ok: () => {
        App.do_remove_picker_item(curl)
    }, message: curl})
}

App.do_remove_picker_item = (curl) => {
    let cleaned = []

    for (let item of App.get_picker_items()) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)
    }

    localStorage.setItem(`picker`, JSON.stringify(cleaned))
}