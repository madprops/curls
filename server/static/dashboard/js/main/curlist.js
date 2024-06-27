App.setup_curlist = () => {
    let curlist = DOM.el(`#curlist`)
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

    curlist.title = lines.join(`\n`)

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

    DOM.ev(curlist, `click`, (e) => {
        if (e.target.closest(`.curlist_item`)) {
            if (e.shiftKey) {
                App.select_curlist_range(e.target)
            }
            else if (e.ctrlKey) {
                App.select_curlist_toggle(e.target)
            }
            else {
                App.select_curlist_item(e.target)
            }
        }
    })

    DOM.ev(curlist, `contextmenu`, (e) => {
        e.preventDefault()

        if (e.target.closest(`.curlist_item`)) {
            App.show_curlist_item_menu(e)
        }
        else {
            App.show_curlist_menu(e)
        }
    })

    DOM.ev(curlist, `dblclick`, (e) => {
        if (e.target.closest(`.curlist_item`)) {
            App.edit_curl(e.target.textContent)
        }
        else {
            App.add_curl(`bottom`)
        }
    })

    DOM.ev(curlist, `auxclick`, (e) => {
        if (e.button === 1) {
            if (e.target.closest(`.curlist_item`)) {
                App.remove_curl(e.target.textContent)
            }
        }
    })

    DOM.ev(curlist, `keydown`, (e) => {
        if (e.key === `Delete`) {
            App.remove_selected_curls()
        }
        else if (e.key === `ArrowUp`) {
            App.select_curlist(`up`, e.shiftKey)
        }
        else if (e.key === `ArrowDown`) {
            App.select_curlist(`down`, e.shiftKey)
        }
        else if (e.key === `c`) {
            if (e.ctrlKey) {
                App.copy_curlist(e)
            }
        }
    })

    DOM.ev(curlist, `focusout`, (e) => {
        App.unselect_curlist()
    })

    App.curlist_drag_events()
    App.update_curlist()
}

App.update_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    curlist.innerHTML = ``
    let curls = App.get_curls()

    for (let curl of curls) {
        let item = DOM.create(`div`)
        item.textContent = curl
        item.classList.add(`curlist_item`)
        item.classList.add(`glow`)
        item.draggable = true
        curlist.append(item)
    }

    App.update_curlist_top()
}

App.update_curlist_top = () => {
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = App.get_curls()
    curlist_top.textContent = `Curls (${curls.length})`
}

App.get_curls_name = (color) => {
    return `curls_${color}`
}

App.copy_curlist = (e) => {
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
                    App.copy_curlist(e)
                }
            },
            {
                text: `Replace`,
                action: () => {
                    App.replace_curls(e)
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

    NeedContext.show({items: items, e: e})
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

            App.save_curls(color, curlist)
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
        let curl = e.target.textContent
        let items = App.get_curlist_items()
        App.drag_index = items.indexOf(e.target)
        e.dataTransfer.setData(`text`, curl)
    })

    DOM.ev(container, `dragover`, (e) => {
        e.preventDefault()
        let items = App.get_curlist_items()
        let index = items.indexOf(e.target)

        if (index === -1) {
            return
        }

        if (index === App.drag_index) {
            return
        }

        let curl = items[App.drag_index]

        if (index > App.drag_index) {
            container.insertBefore(curl, items[index + 1])
        }
        else {
            container.insertBefore(curl, items[index])
        }

        App.drag_index = index
    })

    DOM.ev(container, `dragend`, (e) => {
        let curls = App.get_curlist_items().map(x => x.textContent)
        App.save_curls(curls)
        App.sort_if_order()
    })
}

App.show_curlist_item_menu = (e) => {
    let items = [
        {
            text: `Edit`,
            action: () => {
                App.edit_curl(e.target.textContent)
            }
        },
        {
            text: `Copy`,
            action: () => {
                App.copy_curl(e.target.textContent)
            }
        },
        {
            text: `Remove`,
            action: () => {
                App.remove_a_curl(e.target.textContent)
            }
        },
        {
            text: `To Top`,
            action: () => {
                App.curl_to_top(e.target.textContent)
            }
        },
        {
            text: `To Bottom`,
            action: () => {
                App.curl_to_bottom(e.target.textContent)
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.select_curlist_item = (target) => {
    let selected = `selected`
    let items = App.get_curlist_items()

    for (let item of items) {
        item.classList.remove(selected)
    }

    target.classList.add(selected)
}

App.select_curlist_range = (target) => {
    let selected = `selected`
    let items = App.get_curlist_items()
    let index = items.indexOf(target)
    let last = items.findIndex(x => x.classList.contains(selected))

    if (last === -1) {
        target.classList.add(selected)
        return
    }

    let start = Math.min(index, last)
    let end = Math.max(index, last)

    for (let i = start; i <= end; i++) {
        items[i].classList.add(selected)
    }
}

App.select_curlist_toggle = (target) => {
    let selected = `selected`
    target.classList.toggle(selected)
}

App.get_selected_curls = () => {
    let selected = `selected`
    let items = App.get_curlist_items()
    let selected_items = items.filter(x => x.classList.contains(selected))
    return selected_items.map(x => x.textContent)
}

App.get_selected_items = () => {
    let selected = `selected`
    let items = App.get_curlist_items()
    return items.filter(x => x.classList.contains(selected))
}

App.unselect_curlist = () => {
    let selected = `selected`
    let items = App.get_curlist_items()

    for (let item of items) {
        item.classList.remove(selected)
    }
}

App.get_curlist_items = () => {
    return DOM.els(`#curlist .curlist_item`)
}

App.select_curlist = (direction, shift) => {
    let selected = `selected`
    let items = App.get_curlist_items()
    let selected_items = App.get_selected_items()

    if (!selected_items.length) {
        if (direction === `up`) {
            items[items.length - 1].classList.add(selected)
        }
        else if (direction === `down`) {
            items[0].classList.add(selected)
        }

        return
    }

    if ((selected_items.length > 1) && !shift) {
        App.unselect_curlist()

        if (direction === `up`) {
            selected_items[0].classList.add(selected)
        }
        else if (direction === `down`) {
            selected_items[selected_items.length - 1].classList.add(selected)
        }

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

    if (direction === `up`) {
        if (index === 0) {
            return
        }

        if (!shift) {
            App.unselect_curlist()
        }

        items[index - 1].classList.add(selected)
    }
    else if (direction === `down`) {
        if (index === (items.length - 1)) {
            return
        }

        if (!shift) {
            App.unselect_curlist()
        }

        items[index + 1].classList.add(selected)
    }
}