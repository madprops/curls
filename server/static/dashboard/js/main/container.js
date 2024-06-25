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

    if (els) {
        App.container_not_empty()
    }
    else {
        App.empty_container()
    }
}

App.check_visible = () => {
    let els = DOM.els(`#container .item`)

    for (let el of els) {7
        if (el.classList.contains(`hidden`)) {
            continue
        }

        App.container_not_empty()
        return
    }

    App.container_is_empty()
}

App.container_is_empty = () => {
    let container = DOM.el(`#container`)
    container.classList.add(`empty`)
}

App.container_not_empty = () => {
    let container = DOM.el(`#container`)
    container.classList.remove(`empty`)
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
    App.container_is_empty()
    App.unselect()
}