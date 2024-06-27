App.setup_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)

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
                text: `Sort (Ascending)`,
                action: () => {
                    App.sort_curlist(`asc`)
                }
            },
            {
                text: `Sort (Descending)`,
                action: () => {
                    App.sort_curlist(`desc`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Remove`,
                action: () => {
                    App.remove_a_curl()
                }
            },
            {
                text: `Remove Not Found`,
                action: () => {
                    App.remove_not_found()
                }
            },
            {
                text: `Remove Empty`,
                action: () => {
                    App.remove_empty()
                }
            },
            {
                text: `Remove Old`,
                action: () => {
                    App.remove_old()
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
                text: `Empty`,
                action: () => {
                    App.empty_curls()
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

    App.save_curls()
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
        let items = Array.from(container.children)
        App.drag_index = items.indexOf(e.target)
        e.dataTransfer.setData(`text`, curl)
    })

    DOM.ev(container, `dragover`, (e) => {
        e.preventDefault()
        let items = Array.from(container.children)
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
        let curls = Array.from(container.children).map(x => x.textContent)
        App.save_curls(App.color_mode, curls)
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