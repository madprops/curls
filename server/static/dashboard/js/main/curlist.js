App.setup_curlist = () => {
    let container = DOM.el(`#curlist_container`)
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
        App.show_curlist_menu(e)
        e.preventDefault()
    })

    App.curlist_enabled = App.load_curlist_enabled()
    App.check_curlist_enabled()

    DOM.ev(container, `click`, (e) => {
        let item = App.extract_curlist_item(e.target)

        if (item) {
            if (e.shiftKey) {
                App.select_curlist_range(item)
            }
            else if (e.ctrlKey) {
                App.select_curlist_toggle(item)
            }
            else {
                App.select_curlist_item(item)
            }
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        let item = App.extract_curlist_item(e.target)
        let curl = App.extract_curlist_curl(item)

        if (item) {
            App.show_item_menu({curl: curl, e: e})
        }
        else {
            App.show_curlist_menu(e)
        }

        e.preventDefault()
    })

    DOM.ev(container, `dblclick`, (e) => {
        let item = App.extract_curlist_item(e.target)
        let curl = App.extract_curlist_curl(item)

        if (item) {
            App.edit_curl(curl)
        }
        else {
            App.add_curls(`bottom`)
        }
    })

    DOM.ev(container, `auxclick`, (e) => {
        let item = App.extract_curlist_item(e.target)
        let curl = App.extract_curlist_curl(item)
        let selected = App.get_selected_items()

        if (e.button === 1) {
            if (item) {
                if (selected.length && selected.includes(item)) {
                    App.remove_selected_curls()
                }
                else {
                    App.select_curlist_item(item)
                    App.remove_curls([curl])
                }
            }
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
                App.curlist_move_up()
                return
            }

            App.select_curlist_vertical(`up`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            if (e.ctrlKey) {
                e.preventDefault()
                App.curlist_move_down()
                return
            }

            App.select_curlist_vertical(`down`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `c`) {
            if (e.ctrlKey) {
                App.copy_curlist()
                e.preventDefault()
            }
        }
        else if (e.key === `Escape`) {
            if (App.peek_open) {
                App.hide_peek()
            }
            else {
                App.unselect_curlist()
            }
        }
    })

    let filter = DOM.el(`#curlist_filter`)

    DOM.ev(filter, `keydown`, (e) => {
        if (e.key === `Escape`) {
            App.clear_curlist_filter()
            App.hide_peek()
        }
        else if (e.key === `ArrowUp`) {
            App.select_curlist_vertical(`up`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            App.select_curlist_vertical(`down`, e.shiftKey)
            e.preventDefault()
        }
        else {
            App.filter_curlist()
        }
    })

    App.curlist_filter_debouncer = App.create_debouncer(
        App.do_filter_curlist, App.curlist_filter_debouncer_delay)

    filter.value = ``

    App.curlist_drag_events()
    App.update_curlist()
}

App.update_curlist = (curls) => {
    let curlist = DOM.el(`#curlist`)
    curlist.innerHTML = ``

    if (!curls) {
        curls = App.get_curls()
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

    App.update_curlist_top()
    App.blank_curlist_filter()
    DOM.el(`#curlist_container`).scrollTop = 0
    App.update_autocomplete()
}

App.update_curlist_top = () => {
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = App.get_curls()
    curlist_top.textContent = `Curls (${curls.length})`
}

App.get_curls_name = (color) => {
    return `curls_${color}`
}

App.copy_curlist = () => {
    let curls = App.get_curls()
    let text = curls.join(` `)
    App.copy_to_clipboard(text)
}

App.show_curlist_menu = (e) => {
    let curls = App.get_curls()
    let items

    let data = [
        {
            separator: true,
        },
        {
            text: `Export`,
            action: () => {
                App.export_curlist()
            }
        },
        {
            text: `Import`,
            action: () => {
                App.import_curlist()
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
                    App.add_curls(`top`)
                }
            },
            {
                text: `Add (Bottom)`,
                action: () => {
                    App.add_curls(`bottom`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Sort (Asc)`,
                action: () => {
                    App.sort_curlist(`asc`)
                }
            },
            {
                text: `Sort (Desc)`,
                action: () => {
                    App.sort_curlist(`desc`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Copy`,
                action: () => {
                    App.copy_curlist()
                }
            },
            {
                text: `Replace`,
                action: () => {
                    App.replace_curls()
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
                    App.add_curls(`top`)
                }
            },
            ...data,
        ]
    }

    NeedContext.show({
        items: items, e: e, after_hide: () => {
            App.focus_curlist()
        }
    })
}

App.load_curlist_enabled = () => {
    let saved = localStorage.getItem(`curlist_enabled`) || `true`
    return saved === `true`
}

App.check_curlist_enabled = () => {
    if (App.curlist_enabled) {
        App.show_curlist()
    }
    else {
        App.hide_curlist()
    }
}

App.show_curlist = () => {
    DOM.show(`#left_side`)
    App.curlist_enabled = true
}

App.hide_curlist = () => {
    DOM.hide(`#left_side`)
    App.curlist_enabled = false
}

App.toggle_curlist = () => {
    if (App.curlist_enabled) {
        App.hide_curlist()
    }
    else {
        App.show_curlist()
    }

    localStorage.setItem(`curlist_enabled`, App.curlist_enabled)
}

App.sort_curlist = (how) => {
    let w = how === `asc` ? `Ascending` : `Descending`

    App.confirm({title: `Sort Curls`, ok: () => {
        App.do_sort_curlist(how)
    }, message: `${w} Order`})
}

App.do_sort_curlist = (how) => {
    let curls = App.get_curls()

    if (how === `asc`) {
        curls.sort()
    }
    else if (how === `desc`) {
        curls.sort().reverse()
    }

    App.save_curls(curls)
    App.update_curlist()
    App.sort_if_order()
}

App.export_curlist = () => {
    let curlists = {}

    for (let color in App.colors) {
        let curlist = App.get_curls(color)

        if (!curlist.length) {
            continue
        }

        curlists[color] = curlist
    }

    if (!Object.keys(curlists).length) {
        App.alert(`No curls to export`)
        return
    }

    let data = App.sanitize(JSON.stringify(curlists))
    App.alert(data, `Copy the data below`)
}

App.import_curlist = () => {
    App.prompt({title: `Paste Data`, callback: (value) => {
        App.import_curlist_submit(value)
    }, message: `You get this data in Export`})
}

App.import_curlist_submit = (data) => {
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

            App.save_curls(curlist, color)
            modified = true
        }

        if (!modified) {
            App.alert(`No curls to import`)
            return
        }

        App.update_curlist()
        App.update()
    }
    catch (err) {
        App.error(err)
        App.alert(err)
    }
}

App.curlist_drag_events = () => {
    let container = DOM.el(`#curlist`)

    DOM.ev(container, `dragstart`, (e) => {
        let item = App.extract_curlist_item(e.target)
        let curl = App.extract_curlist_curl(item)
        App.drag_y_curlist = e.clientY

        e.dataTransfer.setData(`text`, curl)
        e.dataTransfer.setDragImage(new Image(), 0, 0)

        let selected = App.get_selected_items()

        if (selected.length && selected.includes(item)) {
            App.drag_items_curlist = selected
        }
        else {
            App.select_curlist_item(item)
            App.drag_items_curlist = [item]
        }
    })

    DOM.ev(container, `dragenter`, (e) => {
        let items = App.get_curlist_elements()
        let item = App.extract_curlist_item(e.target)
        let index = items.indexOf(item)

        if (index === -1) {
            return
        }

        let direction = (e.clientY > App.drag_y_curlist) ? `down` : `up`
        App.drag_y_curlist = e.clientY

        if (direction === `up`) {
            item.before(...App.drag_items_curlist)
        }
        else if (direction === `down`) {
            item.after(...App.drag_items_curlist)
        }
    })

    DOM.ev(container, `dragend`, (e) => {
        App.save_after_move()
    })
}

App.get_curlist_curls = () => {
    let elements = App.get_curlist_elements()
    let curls = []

    for (let el of elements) {
        curls.push(el.dataset.curl)
    }

    return curls
}

App.select_curlist_item = (item) => {
    let items = App.get_curlist_elements()

    for (let it of items) {
        App.do_unselect_curlist_item(it)
    }

    App.do_select_curlist_item({item: item})
    App.prev_curlist_range_item = item
}

App.do_select_curlist_item = (args = {}) => {
    let def_args = {
        block: `nearest`,
        peek: true,
        shadow: true,
    }

    App.def_args(def_args, args)
    args.item.classList.add(`selected`)

    if (args.block !== `none`) {
        args.item.scrollIntoView({ block: args.block })
    }

    if (args.peek) {
        let curl = App.extract_curlist_curl(args.item)
        App.show_peek(curl)
    }

    if (args.shadow) {
        let curl = App.extract_curlist_curl(args.item)
        App.shadow_item(curl)
    }
}

App.do_unselect_curlist_item = (item) => {
    item.classList.remove(`selected`)
}

App.select_curlist_range = (item) => {
    let selected = App.get_selected_items()

    if (!selected.length) {
        return
    }

    if (item === App.prev_curlist_range_item) {
        return
    }

    let items = App.curlist_get_visible()
    let index = items.indexOf(item)
    let prev_index = items.indexOf(App.prev_curlist_range_item)
    let first_index = items.indexOf(selected[0])
    let last_index = items.indexOf(selected[selected.length - 1])
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
        if (App.prev_curlist_range_item === selected[0]) {
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
        App.do_select_curlist_range(item, index, last_index)
    }
    else {
        App.do_select_curlist_range(item, first_index, index)
    }

    App.prev_curlist_range_item = item
}

App.do_select_curlist_range = (item, start, end) => {
    let items = App.curlist_get_visible()

    for (let i = 0; i < items.length; i++) {
        if ((i < start) || (i > end)) {
            App.do_unselect_curlist_item(items[i])
            continue
        }

        let act = items[i] === item
        App.do_select_curlist_item({item: items[i], peek: act, shadow: act})
    }
}

App.select_curlist_toggle = (item) => {
    item.classList.toggle(`selected`)
    App.prev_curlist_range_item = item
}

App.get_selected_curls = () => {
    let items = App.get_curlist_elements()
    let selected_items = items.filter(x => x.classList.contains(`selected`))
    let curls = []

    for (let item of selected_items) {
        curls.push(item.dataset.curl)
    }

    return curls
}

App.get_selected_items = () => {
    let items = App.get_curlist_elements()
    return items.filter(x => x.classList.contains(`selected`))
}

App.unselect_curlist = () => {
    let items = App.get_curlist_elements()

    for (let item of items) {
        item.classList.remove(`selected`)
    }

    App.unshadow_items()
}

App.get_curlist_elements = () => {
    return DOM.els(`#curlist .curlist_item`)
}

App.get_curlist_item = (curl) => {
    let items = App.get_curlist_elements()
    return items.find(x => x.dataset.curl === curl)
}

App.select_curlist_vertical = (direction, shift) => {
    let items = App.curlist_get_visible()
    let selected = App.get_selected_items()
    let prev_index = items.indexOf(App.prev_curlist_range_item)
    let first_index = items.indexOf(selected[0])
    let last_index = items.indexOf(selected[selected.length - 1])

    if (!selected.length) {
        let item

        if (direction === `up`) {
            item = items[items.length - 1]
        }
        else if (direction === `down`) {
            item = items[0]
        }

        App.select_curlist_item(item)
        return
    }

    if (direction === `up`) {
        if (shift) {
            let item = items[prev_index - 1]

            if (!item) {
                return
            }

            App.select_curlist_range(item)
        }
        else {
            let item

            if (selected.length > 1) {
                item = selected[0]
            }
            else {
                item = items[first_index - 1]
            }

            if (!item) {
                return
            }

            App.select_curlist_item(item)
        }
    }
    else if (direction === `down`) {
        if (shift) {
            let item = items[prev_index + 1]

            if (!item) {
                return
            }

            App.select_curlist_range(item)
        }
        else {
            let item

            if (selected.length > 1) {
                item = selected[selected.length - 1]
            }
            else {
                item = items[last_index + 1]
            }

            if (!item) {
                return
            }

            App.select_curlist_item(item)
        }
    }
}

App.focus_curlist = () => {
    DOM.el(`#curlist`).focus()
}

App.filter_curlist = () => {
    App.curlist_filter_debouncer.call()
}

App.curlist_get_visible = () => {
    let els = App.get_curlist_elements()
    return els.filter(x => !x.classList.contains(`hidden`))
}

App.get_curlist_filter_value = () => {
    return DOM.el(`#curlist_filter`).value.toLowerCase().trim()
}

App.do_filter_curlist = () => {
    let els = App.get_curlist_elements()
    let value = App.get_curlist_filter_value()

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

App.blank_curlist_filter = () => {
    DOM.el(`#curlist_filter`).value = ``
}

App.clear_curlist_filter = () => {
    App.blank_curlist_filter()
    let els = App.get_curlist_elements()

    if (!els.length) {
        return
    }

    for (let el of els) {
        DOM.show(el)
    }

    App.unselect_curlist()
}

App.extract_curlist_item = (item) => {
    return item.closest(`.curlist_item`)
}

App.extract_curlist_curl = (item) => {
    if (item) {
        return item.dataset.curl
    }
    else {
        return ``
    }
}

App.focus_curlist_item = (curl) => {
    let item = App.get_curlist_item(curl)

    if (item) {
        App.do_select_curlist_item({item: item})
    }
}

App.curlist_move_up = () => {
    let items = App.get_curlist_elements()
    let selected = App.get_selected_items()
    let first_index = items.indexOf(selected[0])

    if (first_index === 0) {
        return
    }

    if (first_index === 0) {
        return
    }

    let prev = items[first_index - 1]
    prev.before(...selected)
    selected[0].scrollIntoView({ block: `center` })
    App.save_after_move()
}

App.curlist_move_down = () => {
    let items = App.get_curlist_elements()
    let selected = App.get_selected_items()
    let last_index = items.indexOf(selected[selected.length - 1])

    if (last_index === items.length - 1) {
        return
    }

    if (last_index === items.length - 1) {
        return
    }

    let next = items[last_index + 1]
    next.after(...selected)
    selected[selected.length - 1].scrollIntoView({ block: `center` })
    App.save_after_move()
}

App.save_after_move = () => {
    let curls = App.get_curlist_curls()
    App.save_curls(curls)
    App.sort_if_order()
}