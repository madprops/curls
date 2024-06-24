App.setup = () => {
    App.setup_buttons()
    App.setup_color()
    App.setup_curlist()
    App.setup_items()
    App.setup_container()
    App.setup_updater()
    App.setup_sort()
    App.setup_change()
    App.setup_picker()
    App.clean_curlist()
    App.setup_status()
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

App.update_title = () => {
    let color = App.capitalize(App.color)
    document.title = `Curls - ${color}`
}