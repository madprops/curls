/*

This is the main container widget with the vertical items

*/

const Container = {
    check_scroll_debouncer_delay: 100,
    wrap_enabled: true,
    highlight_enabled: true,
    update_debouncer_delay: 100,
    highlight_debouncer_delay: 50,
    ls_name_wrap: `wrap_enabled`,
    ls_name_highlight: `highlight_enabled`,
    ls_name_date_mode: `date_mode`,
}

Container.setup = () => {
    let outer = DOM.el(`#container_outer`)
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        if (e.target.closest(`.item_updated`)) {
            Container.change_date_mode()
            return
        }

        if (e.target.closest(`.item_icon`)) {
            let curl = e.target.closest(`.item`).dataset.curl
            Items.show_menu({curl: curl, e: e, from: `container`})
            return
        }
    })

    DOM.ev(container, `auxclick`, (e) => {
        if (e.button == 1) {
            if (e.target.closest(`.item_icon`)) {
                let curl = e.target.closest(`.item`).dataset.curl
                App.remove_curls([curl])
                return
            }
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        if (e.target.closest(`.item_icon`)) {
            e.preventDefault()
            let curl = e.target.closest(`.item`).dataset.curl
            Items.show_menu({curl: curl, e: e, from: `container`})
        }
    })

    Container.check_scroll_debouncer = App.create_debouncer(
        Container.do_check_scroll, Container.check_scroll_debouncer_delay)

    DOM.ev(outer, `scroll`, (e) => {
        Container.check_scroll()
    })

    let observer = new MutationObserver((list, observer) => {
        Container.check_scroll()
    })

    observer.observe(container, { childList: true })
    Container.drag_events()

    Container.wrap_enabled = Container.load_wrap_enabled()
    Container.highlight_enabled = Container.load_highlight_enabled()

    Container.update_debouncer = App.create_debouncer((args) => {
        Container.do_update(args)
    }, Container.update_debouncer_delay)

    Container.highlight_debouncer = App.create_debouncer((args) => {
        Container.do_highlight(args)
    }, Container.highlight_debouncer_delay)
}

Container.clear = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

Container.empty = () => {
    Container.set_info(App.empty_info)
}

Container.check_empty = () => {
    let els = Container.get_items()

    if (!els) {
        Container.empty()
    }
}

Container.loading = () => {
    Container.set_info(`Loading...`)
}

Container.set_info = (info) => {
    let container = DOM.el(`#container`)
    let item = DOM.create(`div`, `info_item`)
    item.innerHTML = info
    container.innerHTML = ``
    container.append(item)
    App.deselect()
}

Container.get_items = () => {
    return DOM.els(`#container .item`)
}

Container.scroll_top = () => {
    let container = DOM.el(`#container_outer`)
    container.scrollTop = 0
}

Container.scroll_bottom = () => {
    let container = DOM.el(`#container_outer`)
    container.scrollTop = container.scrollHeight
}

Container.check_scroll = () => {
    Container.check_scroll_debouncer.call()
}

Container.do_check_scroll = () => {
    Container.check_scroll_debouncer.cancel()
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

Container.drag_events = () => {
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
        let items = Container.get_items()
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
        Container.order_based_on_container()
    })
}

Container.order_based_on_container = () => {
    let items = Container.get_items()
    let curls = items.map(item => item.dataset.curl)

    if (!curls || !curls.length) {
        return
    }

    Curls.save(curls)
    Curlist.update()
}

Container.save_wrap_enabled = () => {
    App.save(Container.ls_name_wrap, Container.wrap_enabled)
}

Container.load_wrap_enabled = () => {
    return App.load_boolean(Container.ls_name_wrap)
}

Container.save_highlight_enabled = () => {
    App.save(Container.ls_name_highlight, Container.highlight_enabled)
}

Container.load_highlight_enabled = () => {
    return App.load_boolean(Container.ls_name_highlight)
}

Container.add = (items, curls) => {
    let normal = Items.list.filter(item => !item.missing)
    Items.list = [...items]

    for (let item of normal) {
        if (Items.list.find(x => x.curl === item.curl)) {
            continue
        }

        Items.list.push(item)
    }

    let missing = Items.find_missing()
    Items.list.push(...missing)
    Items.add_dates()
    Container.update({select: curls})
}

Container.insert = (items) => {
    Items.list = items
    Items.list.map(x => x.missing = false)
    let missing = Items.find_missing()
    Items.list.push(...missing)
    Items.add_dates()
    Container.update()
}

Container.update = (args) => {
    Container.update_debouncer.call(args)
}

Container.do_update = (args = {}) => {
    Container.update_debouncer.cancel()

    let def_args = {
        items: Items.list,
        check_filter: true,
        highlight: true,
        select: [],
    }

    App.def_args(def_args, args)
    App.info(`Updating Items`)
    Container.clear()
    Sort.sort(args.items)

    for (let item of args.items) {
        Container.create_element(item)
    }

    App.deselect()
    Container.check_empty()

    if (args.check_filter) {
        Filter.check()
    }

    if (args.highlight) {
        Container.highlight()
    }

    if (args.select.length) {
        Curlist.select_items(args.select)
    }
}

Container.create_element = (item) => {
    let container = DOM.el(`#container`)
    let el = DOM.create(`div`, `item`)
    let item_icon = DOM.create(`div`, `item_icon`)
    item_icon.draggable = true

    let lines = [
        `Click to show menu`,
        `Middle Click to remove`,
    ]

    item_icon.title = lines.join(`\n`)

    let canvas = DOM.create(`canvas`, `item_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    item_icon.append(canvas)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_status = DOM.create(`div`, `item_status`)

    if (!Container.wrap_enabled) {
        item_status.classList.add(`nowrap`)
    }

    let item_updated = DOM.create(`div`, `item_updated glow`)

    item_curl.textContent = item.curl
    item_curl.title = item.curl
    let status = item.status || `Not updated yet`
    item_status.innerHTML = App.sanitize(status)
    item_status.title = status
    App.urlize(item_status)

    item_updated.textContent = item.updated_text

    let lines_2 = [
        item.updated_text,
        `Click to toggle between 12 and 24 hours`,
    ]

    item_updated.title = lines_2.join(`\n`)

    el.append(item_icon)
    el.append(item_curl)
    el.append(item_status)
    el.append(item_updated)

    el.dataset.curl = item.curl

    container.append(el)
    container.append(el)

    item.element = el
}

Container.get_date_mode = () => {
    return App.load_string(Container.ls_name_date_mode, `12`)
}

Container.change_date_mode = () => {
    let selected = window.getSelection().toString()

    if (selected) {
        return
    }

    let date_mode = Container.get_date_mode()
    date_mode = date_mode === `12` ? `24` : `12`
    App.save(Container.ls_name_date_mode, date_mode)
    Items.add_dates()
    Container.update()
}

Container.dehighlight = () => {
    for (let item of Items.list) {
        item.element.classList.remove(`highlight`)
    }
}

Container.highlight = (args) => {
    Container.highlight_debouncer.call(args)
}

Container.do_highlight = (args = {}) => {
    Container.highlight_debouncer.cancel()

    let def_args = {
        behavior: `smooth`,
    }

    App.def_args(def_args, args)

    if (!Container.highlight_enabled) {
        return
    }

    let selected = Curlist.get_selected_curls()

    for (let item of Items.list) {
        if (!item || !item.element) {
            continue
        }

        if (selected.includes(item.curl)) {
            item.element.classList.add(`highlight`)
        }
        else {
            item.element.classList.remove(`highlight`)
        }
    }

    if (args.curl) {
        let item = Items.get(args.curl)

        if (item && item.element) {
            App.scroll_element({item: item.element, behavior: args.behavior})
        }
    }
}