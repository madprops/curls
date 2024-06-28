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
                alt_action: (e) => {
                    App.remove_picker(item.curl)
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
                App.clear_pickers()
            },
        })
    }

    NeedContext.show({items: items, e: e})
}

App.export_pickers = () => {
    let data = JSON.stringify(App.get_picker_items())
    let message = `Copy the data below:\n\n${data}`
    alert(message)
}

App.import_pickers = () => {
    let data = prompt(`Paste the data`)

    if (!data) {
        return
    }

    try {
        let items = JSON.parse(data)
        localStorage.setItem(`picker`, JSON.stringify(items))
    }
    catch (err) {
        App.error(err)
        alert(err)
    }
}

App.clear_pickers = () => {
    if (confirm(`Clear all pickers?`)) {
        localStorage.setItem(`picker`, `[]`)
    }
}

App.remove_picker = (curl) => {
    if (confirm(`Remove ${curl} from the picker?`)) {
        App.do_remove_picker(curl)
    }
}

App.do_remove_picker = (curl) => {
    let cleaned = []

    for (let item of App.get_picker_items()) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)
    }

    localStorage.setItem(`picker`, JSON.stringify(cleaned))
}