App.setup_curlist = () => {
    let container = DOM.el(`#curlist_container`)
    let curlist_top = DOM.el(`#curlist_top`)

    let lines = [
        `Add the curls you want to monitor here`,
        `Double Click on empty space to add curls`,
        `Click on the header to show the menu`,
        `Right on empty space to show the menu`,
        `Right on items to show the item menu`,
        `You can select curls with mouse and keyboard`,
        `Press Delete to remove selected curls`,
    ]

    container.title = lines.join(`\n`)

    DOM.evs(curlist_top, [`click`, `contextmenu`], (e) => {
        App.show_curlist_menu(e)
        e.preventDefault()
    })

    let enabled = localStorage.getItem(`curlist_enabled`) || `true`

    if (enabled === `true`) {
        App.show_curlist()
    }
    else {
        App.hide_curlist()
    }

    DOM.ev(container, `click`, (e) => {
        let item = App.extract_curlist_item(e.target)
        let curl = App.extract_curlist_curl(e.target)

        if (item) {
            if (e.shiftKey) {
                App.select_curlist_range(item)
            }
            else if (e.ctrlKey) {
                App.select_curlist_toggle(item)
            }
            else {
                App.select_curlist_item(item)
                App.toggle_peek(curl)
            }
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        let item = App.extract_curlist_item(e.target)

        if (item) {
            App.show_curlist_item_menu(e)
        }
        else {
            App.show_curlist_menu(e)
        }

        e.preventDefault()
    })

    DOM.ev(container, `dblclick`, (e) => {
        let item = App.extract_curlist_item(e.target)

        if (item) {
            App.edit_curl(App.extract_curlist_curl(item))
        }
        else {
            App.add_curl(`bottom`)
        }
    })

    DOM.ev(container, `auxclick`, (e) => {
        let item = App.extract_curlist_item(e.target)

        if (e.button === 1) {
            if (item) {
                App.remove_curl(App.extract_curlist_curl(item))
            }
        }
    })

    DOM.ev(container, `keydown`, (e) => {
        if (e.key === `Delete`) {
            App.remove_selected_curls()
            e.preventDefault()
        }
        else if (e.key === `ArrowUp`) {
            App.select_curlist_vertical(`up`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            App.select_curlist_vertical(`down`, e.shiftKey)
            e.preventDefault()
        }
        else if (e.key === `c`) {
            if (e.ctrlKey) {
                App.copy_curlist(e)
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

        let curl_ = DOM.create(`div`, `curlist_item_curl`)
        curl_.textContent = curl
        item.append(curl_)

        curlist.append(item)
    }

    App.update_curlist_top()
    App.blank_curlist_filter()
    DOM.el(`#curlist_container`).scrollTop = 0
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
    navigator.clipboard.writeText(text)
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
                App.clear_curlists()
            }
        },
    ]

    if (curls.length) {
        items = [
            {
                text: `Add (Top)`,
                action: () => {
                    App.add_curl(`top`)
                }
            },
            {
                text: `Add (Bottom)`,
                action: () => {
                    App.add_curl(`bottom`)
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
                    App.add_curl(`top`)
                }
            },
            ...data,
        ]
    }

    NeedContext.show({ items: items, e: e, after_hide: () => {
        App.focus_curlist()
    }})
}

App.show_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    left_side.classList.remove(`hidden`)
    App.curlist_enabled = true
}

App.hide_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    left_side.classList.add(`hidden`)
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

    if (confirm(`Sort the curls (${w})?`)) {
        App.do_sort_curlist(how)
    }
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
        alert(`No curls to export`)
        return
    }

    let data = App.sanitize(JSON.stringify(curlists))
    let message = `Copy the data below:\n\n${data}`
    alert(message)
}

App.import_curlist = () => {
    let data = prompt(`Paste the data`)

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
            alert(`No curls to import`)
            return
        }

        App.update_curlist()
        App.update(true)
    }
    catch (err) {
        App.error(err)
        alert(err)
    }
}

App.clear_curlists = () => {
    if (confirm(`Clear all curls in all colors?`)) {
        for (let color in App.colors) {
            App.clear_curls(color)
        }

        App.update_curlist()
        App.empty_container()
    }
}

App.curlist_drag_events = () => {
    let container = DOM.el(`#curlist`)

    DOM.ev(container, `dragstart`, (e) => {
        let item = App.extract_curlist_item(e.target)
        let curl = App.extract_curlist_curl(e.target)
        let items = App.get_curlist_elements()

        App.drag_index = items.indexOf(item)
        App.drag_y = e.clientY

        e.dataTransfer.setData(`text`, curl)
        e.dataTransfer.setDragImage(new Image(), 0, 0)

        let selected = App.get_selected_items()

        if (selected.length && selected.includes(item)) {
            App.drag_items = selected
        }
        else {
            App.select_curlist_item(item)
            App.drag_items = [item]
        }
    })

    DOM.ev(container, `dragenter`, (e) => {
        let items = App.get_curlist_elements()
        let item = App.extract_curlist_item(e.target)
        let index = items.indexOf(item)

        if (index === -1) {
            return
        }

        let direction = e.clientY > App.drag_y ? `down` : `up`
        App.drag_y = e.clientY

        if (direction === `up`) {
            item.before(...App.drag_items)
        }
        else if (direction === `down`) {
            item.after(...App.drag_items)
        }
    })

    DOM.ev(container, `dragend`, (e) => {
        let curls = App.get_curlist_curls()
        App.save_curls(curls)
        App.sort_if_order()
    })
}

App.get_curlist_curls = () => {
    let elements = App.get_curlist_elements()
    let curls = []

    for (let el of elements) {
        curls.push(el.textContent)
    }

    return curls
}

App.show_curlist_item_menu = (e) => {
    let selected = App.get_selected_items()
    let item = App.extract_curlist_item(e.target)
    let curl = App.extract_curlist_curl(e.target)

    if (!selected.length || !selected.includes(item)) {
        App.select_curlist_item(item)
    }

    let items = []

    if (selected.length > 1) {
        items = [
            {
                text: `Remove`,
                action: () => {
                    App.remove_selected_curls()
                }
            },
        ]
    }
    else {
        items = [
            {
                text: `Edit`,
                action: () => {
                    App.edit_curl(curl)
                }
            },
            {
                text: `Copy`,
                action: () => {
                    App.copy_curl(curl)
                }
            },
            {
                text: `Remove`,
                action: () => {
                    App.remove_curl(curl)
                }
            },
            {
                text: `To Top`,
                action: () => {
                    App.curl_to_top(curl)
                }
            },
            {
                text: `To Bottom`,
                action: () => {
                    App.curl_to_bottom(curl)
                }
            },
        ]
    }

    NeedContext.show({ items: items, e: e, after_hide: () => {
        App.focus_curlist()
    }})
}

App.select_curlist_item = (target) => {
    let items = App.get_curlist_elements()

    for (let item of items) {
        App.do_unselect_curlist_item(item)
    }

    App.do_select_curlist_item(target)
}

App.do_select_curlist_item = (target, block = `nearest`) => {
    target.classList.add(`selected`)
    target.scrollIntoView({ block: block })
}

App.do_unselect_curlist_item = (target) => {
    target.classList.remove(`selected`)
}

App.select_curlist_range = (target) => {
    let items = App.get_curlist_elements()
    let index = items.indexOf(target)
    let last = items.findIndex(x => x.classList.contains(`selected`))

    if (last === -1) {
        App.do_select_curlist_item(target)
        return
    }

    let start = Math.min(index, last)
    let end = Math.max(index, last)

    for (let i = start; i <= end; i++) {
        App.do_select_curlist_item(items[i])
    }
}

App.select_curlist_toggle = (target) => {
    target.classList.toggle(`selected`)
}

App.get_selected_curls = () => {
    let items = App.get_curlist_elements()
    let selected_items = items.filter(x => x.classList.contains(`selected`))
    let curls = []

    for (let item of selected_items) {
        curls.push(item.textContent)
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
}

App.get_curlist_elements = () => {
    return DOM.els(`#curlist .curlist_item`)
}

App.select_curlist_vertical = (direction, shift, curl) => {
    let items = App.curlist_get_visible()
    let selected_items = App.get_selected_items()

    if (!selected_items.length) {
        let item

        if (direction === `up`) {
            item = items[items.length - 1]
        }
        else if (direction === `down`) {
            item = items[0]
        }

        App.do_select_curlist_item(item)
        App.show_peek(App.extract_curlist_curl(item))
        return
    }

    if ((selected_items.length > 1) && !shift) {
        let item

        if (direction === `up`) {
            item = selected_items[0]
        }
        else if (direction === `down`) {
            item = selected_items[selected_items.length - 1]
        }

        App.select_curlist_item(item)
        App.show_peek(App.extract_curlist_curl(item))
        return
    }

    let index

    if (direction === `up`) {
        index = items.findIndex(x => x === selected_items[0])
    }
    else if (direction === `down`) {
        index = items.findIndex(x => x === selected_items[selected_items.length - 1])
    }

    if (index === -1) {
        return
    }

    let new_index = index
    let on_edge = false

    if (direction === `up`) {
        new_index -= 1

        if (new_index < 0) {
            if (shift) {
                return
            }

            new_index = items.length - 1
            on_edge = true
        }
    }
    else if (direction === `down`) {
        new_index += 1

        if (new_index >= items.length) {
            if (shift) {
                return
            }

            new_index = 0
            on_edge = true
        }
    }

    let item = items[new_index]

    if (!shift) {
        App.unselect_curlist()
        App.show_peek(App.extract_curlist_curl(item))
    }

    let block = on_edge ? `center` : `nearest`
    App.do_select_curlist_item(item, block)
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

    function hide (el) {
        el.classList.add(`hidden`)
    }

    function show (el) {
        el.classList.remove(`hidden`)
    }

    for (let el of els) {
        let curl = el.textContent.toLowerCase()

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
        el.classList.remove(`hidden`)
    }

    App.unselect_curlist()
}

App.extract_curlist_item = (item) => {
    return item.closest(`.curlist_item`)
}

App.extract_curlist_curl = (item) => {
    let el = item.closest(`.curlist_item`)

    if (!el) {
        return ``
    }

    return el.textContent
}