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
            text: `Empty`,
            action: () => {}
        })
    }

    for (let item of picker_items) {
        items.push({
            text: item.curl,
            action: () => {
                DOM.el(`#change_curl`).value = item.curl
                DOM.el(`#change_key`).value = item.key
                App.add_to_picker()
            }
        })
    }

    NeedContext.show({items: items, e: e})
}