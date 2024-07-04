/*

The curlist is the sidebar at the last
This is the list of curls of a specific color
Several features are implemented
Like navigation, selection, filtering

*/

const Curlist = {
    enabled: true,
    mouse_down: false,
    mouse_selected: false,
    filter_debouncer_delay: 250,
    ls_name: `curlist_enabled`,
}

Curlist.setup = () => {
    let container = DOM.el(`#curlist_container`)
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)

    let lines = [
        `Add the curls you want to monitor here`,
        `Double Click empty space to add curls`,
        `Click on the header to show menu`,
        `Right Click empty space to show menu`,
        `Press Delete to remove selected curls`,
    ]

    container.title = lines.join(`\n`)

    DOM.evs(curlist_top, [`click`, `contextmenu`], (e) => {
        Curlist.show_menu(e)
        e.preventDefault()
    })

    Curlist.enabled = Curlist.load_enabled()
    Curlist.check_enabled()

    DOM.ev(container, `contextmenu`, (e) => {
        let item = Curlist.extract_item(e.target)
        let curl = Curlist.extract_curl(item)

        if (item) {
            Items.show_menu({curl: curl, e: e})
        }
        else {
            Curlist.show_menu(e)
        }

        e.preventDefault()
    })

    DOM.ev(container, `dblclick`, (e) => {
        let item = Curlist.extract_item(e.target)

        if (!item) {
            Curls.add(`bottom`)
        }
    })

    DOM.ev(container, `keydown`, (e) => {
        if (e.key === `Delete`) {
            App.remove_selected_curls()
            e.preventDefault()
        }
        else if (e.key === `ArrowUp`) {
            if (e.ctrlKey) {
                e.preventDefault()
                Curlist.move_up()
                return
            }

            Curlist.select_vertical(`up`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            if (e.ctrlKey) {
                e.preventDefault()
                Curlist.move_down()
                return
            }

            Curlist.select_vertical(`down`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `c`) {
            if (e.ctrlKey) {
                Curlist.copy()
                e.preventDefault()
            }
        }
        else if (e.key === `Escape`) {
            Peek.hide()
            Curlist.deselect()
        }
    })

    DOM.ev(container, `mousedown`, function() {
        Curlist.mousedown()
    })

    DOM.ev(container, `mouseup`, function() {
        Curlist.mouseup()
    })

    DOM.ev(container, `mouseover`, function(e) {
        Curlist.mouseover(e)
    })

    DOM.ev(curlist, `click`, (e) => {
        let item = Curlist.extract_item(e.target)

        if (item) {
            let selected = Curlist.get_selected_items()

            if (e.shiftKey && selected.length) {
                Curlist.select_range(item)
            }
            else if (e.ctrlKey && selected.length) {
                Curlist.select_toggle(item)
            }
            else {
                Curlist.select_item(item)
            }
        }
    })

    DOM.ev(curlist, `dblclick`, (e) => {
        let item = Curlist.extract_item(e.target)
        let curl = Curlist.extract_curl(item)

        if (item) {
            Curls.edit(curl)
        }
    })

    DOM.ev(curlist, `auxclick`, (e) => {
        let item = Curlist.extract_item(e.target)
        let curl = Curlist.extract_curl(item)
        let selected = Curlist.get_selected_items()

        if (e.button === 1) {
            if (item) {
                if (selected.length && selected.includes(item)) {
                    App.remove_selected_curls()
                }
                else {
                    Curlist.select_item(item)
                    App.remove_curls([curl])
                }
            }
        }
    })

    let filter = DOM.el(`#curlist_filter`)

    DOM.ev(filter, `keydown`, (e) => {
        if (e.key === `Escape`) {
            Curlist.clear_filter()
            Peek.hide()
        }
        else if (e.key === `ArrowUp`) {
            Curlist.select_vertical(`up`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            Curlist.select_vertical(`down`, e.shiftKey)
            e.preventDefault()
        }
        else {
            Curlist.filter()
        }
    })

    Curlist.filter_debouncer = App.create_debouncer(
        Curlist.do_filter, Curlist.filter_debouncer_delay)

    filter.value = ``

    Block.register(`curlist_vertical`, 100)
    Curlist.drag_events()
    Curlist.update()
}

Curlist.update = (curls) => {
    let curlist = DOM.el(`#curlist`)
    curlist.innerHTML = ``

    if (!curls) {
        curls = Curls.get()
    }

    for (let curl of curls) {
        let item = DOM.create(`div`)
        item.classList.add(`curlist_item`)
        item.draggable = true
        item.dataset.curl = curl

        let lines = [
            `Click to peek`,
            `Right Click to show menu`,
            `Double Click to edit`,
            `Middle Click to remove`,
        ]

        item.title = lines.join(`\n`)
        let curl_ = DOM.create(`div`, `curlist_item_curl`)
        curl_.textContent = curl
        item.append(curl_)

        curlist.append(item)
    }

    Curlist.update_top()
    Curlist.blank_filter()
    DOM.el(`#curlist_container`).scrollTop = 0
    App.update_autocomplete()
}

Curlist.update_top = () => {
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = Curls.get()
    curlist_top.textContent = `Curls (${curls.length})`
}

Curlist.copy = () => {
    let curls = Curls.get()
    let text = curls.join(` `)
    App.copy_to_clipboard(text)
}

Curlist.show_menu = (e) => {
    let curls = Curls.get()
    let items

    let data = [
        {
            separator: true,
        },
        {
            text: `Export`,
            action: () => {
                Curlist.export()
            }
        },
        {
            text: `Import`,
            action: () => {
                Curlist.import()
            }
        },
        {
            text: `Clear`,
            action: () => {
                App.clear_all_curls()
            }
        },
    ]

    if (curls.length) {
        items = [
            {
                text: `Add (Top)`,
                action: () => {
                    Curls.add(`top`)
                }
            },
            {
                text: `Add (Bottom)`,
                action: () => {
                    Curls.add(`bottom`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Sort (Asc)`,
                action: () => {
                    Curlist.sort(`asc`)
                }
            },
            {
                text: `Sort (Desc)`,
                action: () => {
                    Curlist.sort(`desc`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Copy`,
                action: () => {
                    Curlist.copy()
                }
            },
            {
                text: `Replace`,
                action: () => {
                    Curls.replace()
                }
            },
            {
                text: `Remove`,
                action: (e) => {
                    App.show_remove_menu(e)
                }
            },
            ...data,
        ]
    }
    else {
        items = [
            {
                text: `Add`,
                action: () => {
                    Curls.add(`top`)
                }
            },
            ...data,
        ]
    }

    NeedContext.show({
        items: items, e: e, after_hide: () => {
            Curlist.focus()
        }
    })
}

Curlist.load_enabled = () => {
    return App.load_boolean(Curlist.ls_name)
}

Curlist.check_enabled = () => {
    if (Curlist.enabled) {
        Curlist.show()
    }
    else {
        Curlist.hide()
    }
}

Curlist.show = () => {
    DOM.show(`#left_side`)
    Curlist.enabled = true
}

Curlist.hide = () => {
    DOM.hide(`#left_side`)
    Curlist.enabled = false
}

Curlist.toggle = () => {
    if (Curlist.enabled) {
        Curlist.hide()
    }
    else {
        Curlist.show()
    }

    App.save(Curlist.ls_name, Curlist.enabled)
}

Curlist.sort = (how) => {
    let w = how === `asc` ? `Ascending` : `Descending`

    Windows.confirm({title: `Sort Curls`, ok: () => {
        Curlist.do_sort(how)
    }, message: `${w} Order`})
}

Curlist.do_sort = (how) => {
    let curls = Curls.get()

    if (how === `asc`) {
        curls.sort()
    }
    else if (how === `desc`) {
        curls.sort().reverse()
    }

    Curls.save(curls)
    Curlist.update()
    Sort.sort_if_order()
}

Curlist.export = () => {
    let curlists = {}

    for (let color in App.colors) {
        let curlist = Curls.get(color)

        if (!curlist.length) {
            continue
        }

        curlists[color] = curlist
    }

    if (!Object.keys(curlists).length) {
        Windows.alert({message: `No curls to export`})
        return
    }

    Windows.alert_export(curlists)
}

Curlist.import = () => {
    Windows.prompt({title: `Paste Data`, callback: (value) => {
        Curlist.import_submit(value)
    }, message: `You get this data in Export`})
}

Curlist.import_submit = (data) => {
    if (!data) {
        return
    }

    try {
        let curlists = JSON.parse(data)
        let modified = false

        for (let color in curlists) {
            let curlist = curlists[color]

            if (!curlist) {
                continue
            }

            Curls.save(curlist, color)
            modified = true
        }

        if (!modified) {
            Windows.alert({message: `No curls to import`})
            return
        }

        Curlist.update()
        Update.now()
    }
    catch (err) {
        App.error(err)
        Windows.alert({title: `Error`, message: err})
    }
}

Curlist.drag_events = () => {
    let container = DOM.el(`#curlist`)

    DOM.ev(container, `dragstart`, (e) => {
        let item = Curlist.extract_item(e.target)
        let curl = Curlist.extract_curl(item)
        Curlist.drag_y = e.clientY

        e.dataTransfer.setData(`text`, curl)
        e.dataTransfer.setDragImage(new Image(), 0, 0)

        let selected = Curlist.get_selected_items()

        if (selected.length && selected.includes(item)) {
            Curlist.drag_items = selected
        }
        else {
            Curlist.select_item(item)
            Curlist.drag_items = [item]
        }
    })

    DOM.ev(container, `dragenter`, (e) => {
        let items = Curlist.get_elements()
        let item = Curlist.extract_item(e.target)
        let index = items.indexOf(item)

        if (index === -1) {
            return
        }

        let direction = (e.clientY > Curlist.drag_y) ? `down` : `up`
        Curlist.drag_y = e.clientY

        if (direction === `up`) {
            item.before(...Curlist.drag_items)
        }
        else if (direction === `down`) {
            item.after(...Curlist.drag_items)
        }
    })

    DOM.ev(container, `dragend`, (e) => {
        Curlist.save_after_move()
    })

    let filter = DOM.el(`#curlist_filter`)

    DOM.ev(filter, `drop`, (e) => {
        e.preventDefault()
    })
}

Curlist.get_curls = () => {
    let elements = Curlist.get_elements()
    let curls = []

    for (let el of elements) {
        curls.push(el.dataset.curl)
    }

    return curls
}

Curlist.select_item = (item) => {
    let items = Curlist.get_elements()

    for (let it of items) {
        Curlist.do_deselect_item(it)
    }

    Curlist.do_select_item({item: item})
    Curlist.prev_range_item = item
}

Curlist.do_select_item = (args = {}) => {
    let def_args = {
        block: `nearest`,
        peek: true,
        highlight: true,
        highlight_behavior: `smooth`,
    }

    App.def_args(def_args, args)
    args.item.classList.add(`selected`)

    if (args.block !== `none`) {
        App.scroll_element({item: args.item, block: args.block})
    }

    if (args.peek) {
        let curl = Curlist.extract_curl(args.item)
        Peek.show({curl: curl})
    }

    if (args.highlight) {
        let curl = Curlist.extract_curl(args.item)
        Container.highlight({curl: curl, behavior: args.highlight_behavior})
    }
}

Curlist.do_deselect_item = (item) => {
    item.classList.remove(`selected`)
}

Curlist.select_range = (item) => {
    let selected = Curlist.get_selected_items()

    if (!selected.length) {
        return
    }

    if (item === Curlist.prev_range_item) {
        return
    }

    let items = Curlist.get_visible()
    let index = items.indexOf(item)
    let prev_index = items.indexOf(Curlist.prev_range_item)
    let first_index = items.indexOf(selected[0])
    let last_index = items.indexOf(App.last(selected))
    let direction

    if (selected.length === 1) {
        if (index < prev_index) {
            direction = `up`
        }
        else {
            direction = `down`
        }
    }
    else {
        if (Curlist.prev_range_item === selected[0]) {
            direction = `up`
        }
        else {
            direction = `down`
        }
    }

    if (index > last_index) {
        direction = `down`
    }
    else if (index < first_index) {
        direction = `up`
    }

    if (direction === `up`) {
        Curlist.do_select_range(item, index, last_index)
    }
    else {
        Curlist.do_select_range(item, first_index, index)
    }

    Curlist.prev_range_item = item
}

Curlist.do_select_range = (item, start, end) => {
    let items = Curlist.get_visible()

    for (let i = 0; i < items.length; i++) {
        if ((i < start) || (i > end)) {
            Curlist.do_deselect_item(items[i])
            continue
        }

        let peek = items[i] === item
        Curlist.do_select_item({item: items[i], peek: peek, highlight: false})
    }

    let curl = Curlist.extract_curl(item)
    Container.highlight({curl: curl})
}

Curlist.select_toggle = (item) => {
    let curl = Curlist.extract_curl(item)
    item.classList.toggle(`selected`)
    Curlist.prev_range_item = item
    Container.highlight({curl: curl})
    Peek.show({curl: curl})
}

Curlist.get_selected_curls = () => {
    let items = Curlist.get_elements()
    let selected_items = items.filter(x => x.classList.contains(`selected`))
    let curls = []

    for (let item of selected_items) {
        curls.push(item.dataset.curl)
    }

    return curls
}

Curlist.get_selected_items = () => {
    let items = Curlist.get_elements()
    return items.filter(x => x.classList.contains(`selected`))
}

Curlist.deselect = () => {
    let items = Curlist.get_elements()

    for (let item of items) {
        item.classList.remove(`selected`)
    }

    Container.dehighlight()
}

Curlist.get_elements = () => {
    return DOM.els(`#curlist .curlist_item`)
}

Curlist.get_item = (curl) => {
    let items = Curlist.get_elements()
    return items.find(x => x.dataset.curl === curl)
}

Curlist.select_vertical = (direction, shift) => {
    if (Block.charge(`curlist_vertical`)) {
        return
    }

    let items = Curlist.get_visible()
    let selected = Curlist.get_selected_items()
    let prev_index = items.indexOf(Curlist.prev_range_item)
    let first_index = items.indexOf(selected[0])

    if (!selected.length) {
        let item

        if (direction === `up`) {
            item = App.last(items)
        }
        else if (direction === `down`) {
            item = items[0]
        }

        Curlist.select_item(item)
        return
    }

    if (direction === `up`) {
        if (shift) {
            let item = items[prev_index - 1]

            if (!item) {
                return
            }

            Curlist.select_range(item)
        }
        else {
            let item

            if (selected.length > 1) {
                item = selected[0]
            }
            else {
                let index = first_index - 1

                if (index < 0) {
                    index = items.length - 1
                }

                item = items[index]
            }

            if (!item) {
                return
            }

            Curlist.select_item(item)
        }
    }
    else if (direction === `down`) {
        if (shift) {
            let item = items[prev_index + 1]

            if (!item) {
                return
            }

            Curlist.select_range(item)
        }
        else {
            let item

            if (selected.length > 1) {
                item = App.last(selected)
            }
            else {
                let index = first_index + 1

                if (index >= items.length) {
                    index = 0
                }

                item = items[index]
            }

            if (!item) {
                return
            }

            Curlist.select_item(item)
        }
    }
}

Curlist.focus = () => {
    DOM.el(`#curlist`).focus()
}

Curlist.get_visible = () => {
    let els = Curlist.get_elements()
    return els.filter(x => !x.classList.contains(`hidden`))
}

Curlist.get_filter_value = () => {
    return DOM.el(`#curlist_filter`).value.toLowerCase().trim()
}

Curlist.filter = () => {
    Curlist.filter_debouncer.call()
}

Curlist.do_filter = () => {
    Curlist.filter_debouncer.cancel()
    let els = Curlist.get_elements()
    let value = Curlist.get_filter_value()

    function hide(el) {
        DOM.hide(el)
    }

    function show(el) {
        DOM.show(el)
    }

    for (let el of els) {
        let curl = el.dataset.curl

        if (curl.includes(value)) {
            show(el)
        }
        else {
            hide(el)
        }
    }
}

Curlist.blank_filter = () => {
    DOM.el(`#curlist_filter`).value = ``
}

Curlist.clear_filter = () => {
    Curlist.blank_filter()
    let els = Curlist.get_elements()

    if (!els.length) {
        return
    }

    for (let el of els) {
        DOM.show(el)
    }

    Curlist.deselect()
}

Curlist.extract_item = (item) => {
    return item.closest(`.curlist_item`)
}

Curlist.extract_curl = (item) => {
    if (item) {
        return item.dataset.curl
    }
    else {
        return ``
    }
}

Curlist.focus_item = (curl) => {
    let item = Curlist.get_item(curl)

    if (item) {
        Curlist.do_select_item({item: item})
    }
}

Curlist.move_up = () => {
    let items = Curlist.get_elements()
    let selected = Curlist.get_selected_items()
    let first_index = items.indexOf(selected[0])

    if (first_index === 0) {
        return
    }

    if (first_index === 0) {
        return
    }

    let prev = items[first_index - 1]
    prev.before(...selected)
    App.scroll_element({item: selected[0]})
    Curlist.save_after_move()
}

Curlist.move_down = () => {
    let items = Curlist.get_elements()
    let selected = Curlist.get_selected_items()
    let last_index = items.indexOf(App.last(selected))

    if (last_index === items.length - 1) {
        return
    }

    if (last_index === items.length - 1) {
        return
    }

    let next = items[last_index + 1]
    next.after(...selected)
    App.scroll_element({item: App.last(selected)})
    Curlist.save_after_move()
}

Curlist.save_after_move = () => {
    let curls = Curlist.get_curls()
    Curls.save(curls)
    Sort.sort_if_order()
}

Curlist.select_items = (curls) => {
    let items = Curlist.get_visible()
    Curlist.deselect()

    for (let curl of curls) {
        let item = Curlist.get_item(curl)
        let index = items.indexOf(item)
        let peek = false

        if ((index === 0) || (index === items.length - 1)) {
            peek = true
        }

        if (item) {
            Curlist.do_select_item({item: item, peek: peek})
        }
    }
}

Curlist.mousedown = () => {
    Curlist.mouse_down = true
    Curlist.mouse_selected = false
}

Curlist.mouseup = () => {
    Curlist.mouse_down = false
    Curlist.mouse_selected = false
}

Curlist.mouseover = (e) => {
    if (!e.target.closest(`.curlist_item`)) {
        return
    }

    if (!Curlist.mouse_down) {
        return
    }

    if (!Curlist.mouse_selected) {
        Curlist.deselect()
    }

    let item = Curlist.extract_item(e.target)
    Curlist.do_select_item({item: item})
    Curlist.mouse_selected = true
}