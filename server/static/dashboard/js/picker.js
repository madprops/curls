App.setup_picker = () => {
    let picker = DOM.el(`#picker`)

    DOM.ev(picker, `click`, (e) => {
        App.show_picker(e)
    })

    let saved = localStorage.getItem(`picker`) || `[]`
    App.picker_items = JSON.parse(saved)

    if (App.picker_items.length) {
        let first = App.picker_items[0]
        DOM.el(`#change_curl`).value = first.curl
        DOM.el(`#change_key`).value = first.key
    }
}

App.add_to_picker = () => {
    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let cleaned = [{curl, key}]

    for (let item of App.picker_items) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)

        if (cleaned.length >= App.max_picker_items) {
            break
        }
    }

    App.picker_items = cleaned
    localStorage.setItem(`picker`, JSON.stringify(App.picker_items))
}

App.show_picker = (e) => {
    let items = []

    if (!App.picker_items.length) {
        items.push({
            text: `Empty`,
            action: () => {}
        })
    }

    for (let item of App.picker_items) {
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