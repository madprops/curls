App.setup_container = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        if (e.target.closest(`.item_updated`)) {
            App.change_date_mode()
        }
        else if (e.target.classList.contains(`item_updated`)) {
            App.change_date_mode()
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

    if (!els) {
        App.empty_container()
    }
}