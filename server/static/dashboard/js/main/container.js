App.setup_container = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        if (e.target.closest(`.item_updated`)) {
            App.change_date_mode()
            return
        }

        if (e.target.closest(`.item_icon`)) {
            App.show_item_menu(e)
            return
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        if (e.target.closest(`.item_icon`)) {
            e.preventDefault()
            App.show_item_menu(e)
        }
    })
}

App.clear_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

App.empty_container = () => {
    App.set_container_info(App.empty_info)
}

App.check_empty = () => {
    let els = DOM.el(`#container .item`)

    if (!els) {
        App.empty_container()
    }
}

App.container_loading = () => {
    App.set_container_info(`Loading...`)
}

App.set_container_info = (info) => {
    let container = DOM.el(`#container`)
    let item = DOM.create(`div`, `info_item`)
    item.innerHTML = info
    container.innerHTML = ``
    container.append(item)
    App.unselect()
}