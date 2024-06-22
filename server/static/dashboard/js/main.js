App.setup = () => {
    App.setup_buttons()
    App.setup_curlist()
    App.setup_updater()
    App.setup_container()
    App.setup_sort()
    App.setup_color()
    App.setup_change()
    App.setup_picker()
    App.clean_curlist()
    App.setup_filter()
    App.update(true)
}

App.setup_buttons = () => {
    let update = DOM.el(`#update`)

    DOM.ev(update, `click`, () => {
        App.update(true)
    })

    let toggle_curlist = DOM.el(`#toggle_curlist`)

    DOM.ev(toggle_curlist, `click`, () => {
        App.toggle_curlist()
    })
}

App.get_sort = () => {
    let sort = DOM.el(`#sort`)
    return sort.options[sort.selectedIndex].value
}

App.clear_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

App.empty_container = () => {
    let container = DOM.el(`#container`)
    let item = DOM.create(`div`, `info_item`)

    let lines = [
        `Add some curls to the list on the left.`,
        `These will be monitored for status changes.`,
        `Above you can change the status of your own curls.`,
        `Use the claim link on the top right to get a new curl.`,
    ]

    item.innerHTML = lines.join(`<br>`)
    container.innerHTML = ``
    container.append(item)
    container.classList.add(`empty`)
    App.unselect()
}