App.setup_curlist = () => {
    let curlist_top = DOM.el(`#curlist_top`)

    DOM.evs(curlist_top, [`click`, `contextmenu`], (e) => {
        App.show_curlist_menu(e)
        e.preventDefault()
    })

    DOM.ev(curlist_top, `contextmenu`, (e) => {
        App.show_curlist_menu(e)
    })

    let enabled = localStorage.getItem(`curlist_enabled`) || `true`

    if (enabled === `true`) {
        App.show_curlist()
    }
    else {
        App.hide_curlist()
    }

    App.update_curlist()
}

App.update_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    curlist.innerHTML = ``
    let curls = App.get_curls_by_color()

    for (let curl of curls) {
        let item = DOM.create(`div`)
        item.textContent = curl
        item.classList.add(`curlist_item`)
        curlist.append(item)
    }

    App.update_curlist_top()
}

App.update_curlist_top = () => {
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = App.get_curls_by_color()
    curlist_top.textContent = `Curls (${curls.length})`
}

App.get_curls_name = (color) => {
    return `curls_${color}`
}

App.copy_curlist = (e) => {
    let curlist = DOM.el(`#curlist`)
    navigator.clipboard.writeText(curlist.value)
}

App.show_curlist_menu = (e) => {
    let curls = App.get_curls_by_color()
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
                text: `Copy`,
                action: () => {
                    App.copy_curlist(e)
                }
            },
            {
                separator: true,
            },
            {
                text: `Add (Top)`,
                action: () => {
                    App.do_add_curl(`top`)
                }
            },
            {
                text: `Add (Bottom)`,
                action: () => {
                    App.do_add_curl(`bottom`)
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
            ...data,
        ]
    }
    else {
        items = [
            {
                text: `Add`,
                action: () => {
                    App.do_add_curl(`top`)
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
    let curls = App.get_curls_by_color()

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
        let curlist = App.get_curls_by_color(color)

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
            let name = App.get_curls_name(color)
            localStorage.setItem(name, ``)
        }

        App.update_curlist()
        App.empty_container()
    }
}