App.setup_container = () => {
    let outer = DOM.el(`#container_outer`)
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        if (e.target.closest(`.item_updated`)) {
            App.change_date_mode()
            return
        }

        if (e.target.closest(`.item_icon`)) {
            let curl = e.target.closest(`.item`).dataset.curl
            App.show_curlist_item_menu({curl: curl, e: e, from: `container`})
            return
        }
    })

    DOM.ev(container, `auxclick`, (e) => {
        if (e.button == 1) {
            if (e.target.closest(`.item_icon`)) {
                let curl = e.target.closest(`.item`).dataset.curl
                App.remove_curl(curl)
                return
            }
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        if (e.target.closest(`.item_icon`)) {
            e.preventDefault()
            let curl = e.target.closest(`.item`).dataset.curl
            App.show_curlist_item_menu({curl: curl, e: e, from: `container`})
        }
    })

    App.check_scroll_debouncer = App.create_debouncer(
        App.do_check_scroll, App.check_scroll_debouncer_delay)

    DOM.ev(outer, `scroll`, (e) => {
        App.check_scroll()
    })

    let observer = new MutationObserver((list, observer) => {
        App.check_scroll()
    })

    observer.observe(container, { childList: true })
    App.container_drag_events()
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
    App.check_scroll_debouncer.call()
}

App.do_check_scroll = () => {
    App.check_scroll_debouncer.cancel()
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

App.container_drag_events = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `dragstart`, (e) => {
        if (App.sort_mode !== `order`) {
            e.preventDefault()
            return false
        }

        if (!e.target.classList.contains(`item_icon`)) {
            e.preventDefault()
            return false
        }

        let item = e.target.closest(`.item`)
        let curl = item.dataset.curl
        App.drag_y_container = e.clientY

        e.dataTransfer.setData(`text`, curl)
        e.dataTransfer.setDragImage(new Image(), 0, 0)

        App.drag_items_container = [item]
    })

    DOM.ev(container, `dragenter`, (e) => {
        let items = App.get_container_items()
        let item = e.target.closest(`.item`)
        let index = items.indexOf(item)

        if (index === -1) {
            return
        }

        let direction = (e.clientY > App.drag_y_container) ? `down` : `up`
        App.drag_y_container = e.clientY

        if (direction === `up`) {
            item.before(...App.drag_items_container)
        }
        else if (direction === `down`) {
            item.after(...App.drag_items_container)
        }
    })

    DOM.ev(container, `dragend`, (e) => {
        App.order_based_on_container()
    })
}

App.order_based_on_container = () => {
    let items = App.get_container_items()
    let curls = items.map(item => item.dataset.curl)

    if (!curls || !curls.length) {
        return
    }

    App.save_curls(curls)
    App.update_curlist()
}

App.toggle_scroll = () => {
    let focused = document.activeElement

    if (focused.tagName === `INPUT`) {
        return
    }

    let outer = DOM.el(`#container_outer`)

    if (outer.scrollTop === 0) {
        App.scroll_container_bottom()
    }
    else {
        App.scroll_container_top()
    }

    App.do_check_scroll()
}