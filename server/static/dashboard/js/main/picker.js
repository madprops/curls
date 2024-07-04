/*

The picker stores owned curls

*/

const Picker = {
    max_items: 1000,
    ls_name: `picker`,
}

Picker.setup = () => {
    let picker = DOM.el(`#picker`)

    DOM.ev(picker, `click`, (e) => {
        Picker.show(e)
    })

    let items = Picker.get_items()

    if (items.length) {
        let first = items[0]
        DOM.el(`#change_curl`).value = first.curl
        DOM.el(`#change_key`).value = first.key
    }
}

Picker.get_items = () => {
    let saved = App.load_array(Picker.ls_name)
    return JSON.parse(saved)
}

Picker.add = () => {
    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let cleaned = [{curl, key}]

    for (let item of Picker.get_items()) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)

        if (cleaned.length >= Picker.max_items) {
            break
        }
    }

    App.save(Picker.ls_name, JSON.stringify(cleaned))
}

Picker.show = (e) => {
    let items = []
    let picker_items = Picker.get_items()

    if (!picker_items.length) {
        items.push({
            text: `Import`,
            action: () => {
                Picker.import()
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
                    Picker.add()
                },
                alt_action: () => {
                    Picker.remove_item(item.curl)
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
                Picker.export()
            },
        })

        items.push({
            text: `Import`,
            action: () => {
                Picker.import()
            },
        })

        items.push({
            text: `Clear`,
            action: () => {
                Picker.clear()
            },
        })
    }

    NeedContext.show({items: items, e: e})
}

Picker.export = () => {
    Windows.alert_export(Picker.get_items())
}

Picker.import = () => {
    Windows.prompt({title: `Paste Data`, callback: (value) => {
        Picker.import_submit(value)
    }, message: `You get this data in Export`})
}

Picker.import_submit = (data) => {
    if (!data) {
        return
    }

    try {
        let items = JSON.parse(data)
        App.save(Picker.ls_name, JSON.stringify(items))
    }
    catch (err) {
        App.error(err)
        Windows.alert({title: `Error`, message: err})
    }
}

Picker.clear = () => {
    Windows.confirm({title: `Clear Picker`, ok: () => {
        App.save(Picker.ls_name, `[]`)
    }, message: `Remove all items from the picker`})
}

Picker.remove_item = (curl) => {
    Windows.confirm({title: `Remove Picker Item`, ok: () => {
        Picker.do_remove_item(curl)
    }, message: curl})
}

Picker.do_remove_item = (curl) => {
    let cleaned = []

    for (let item of Picker.get_items()) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)
    }

    App.save(Picker.ls_name, JSON.stringify(cleaned))
}