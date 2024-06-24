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
    let container = DOM.el(`#container`)
    let item = DOM.create(`div`, `info_item`)
    item.innerHTML = App.empty_info
    container.innerHTML = ``
    container.append(item)
    App.container_is_empty()
    App.unselect()
}

App.check_empty = () => {
    let els = DOM.el(`#container .item`)

    if (els) {
        App.container_not_empty()
    }
    else {
        App.empty_container()
    }
}