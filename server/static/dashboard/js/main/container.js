App.setup_container = () => {
    let outer = DOM.el(`#container_outer`)
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

    DOM.ev(outer, `scroll`, (e) => {
        App.check_scroll()
    })

    let observer = new MutationObserver((list, observer) => {
        App.check_scroll()
    })

    observer.observe(container, { childList: true })
}

App.clear_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

App.empty_container = () => {
    App.set_container_info(App.empty_info)
}

App.check_empty = () => {
    let els = App.get_container_items()

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

App.get_container_items = () => {
    return DOM.els(`#container .item`)
}

App.scroll_container_top = () => {
    let container = DOM.el(`#container_outer`)
    container.scrollTop = 0
}

App.scroll_container_bottom = () => {
    let container = DOM.el(`#container_outer`)
    container.scrollTop = container.scrollHeight
}

App.check_scroll = () => {
    let outer = DOM.el(`#container_outer`)
    let top = DOM.el(`#scroller_top`)
    let bottom = DOM.el(`#scroller_bottom`)

    let height = outer.clientHeight
    let scroll = outer.scrollHeight
    let scrolltop = outer.scrollTop

    if (scrolltop > 0) {
        top.classList.remove(`disabled`)
    }
    else {
        top.classList.add(`disabled`)
    }

    if (scrolltop < (scroll - height)) {
        bottom.classList.remove(`disabled`)
    }
    else {
        bottom.classList.add(`disabled`)
    }
}