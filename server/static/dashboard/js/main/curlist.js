App.setup_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)

    DOM.ev(curlist, `focusout`, () => {
        App.clean_curlist()
        App.update_curlist_top()

        if (App.save_curls()) {
            App.update(true)
        }
    })

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

    App.load_curlist()
    App.update_curlist_top()
}

App.get_curlist = () => {
    return DOM.el(`#curlist`).value
}

App.set_curlist = (value) => {
    DOM.el(`#curlist`).value = value
}

App.clean_curlist = () => {
    let curls = App.get_curls()
    let words = []

    for (let curl of curls) {
        let parts = curl.split(` `)
        words.push(...parts)
    }

    words = words.map(x => x.replace(/[^a-zA-Z0-9]/g, ``))
    let cleaned = []

    for (let curl of words) {
        curl = curl.toLowerCase().trim()

        if (!curl) {
            continue
        }

        if (curl.length > App.curl_max_length) {
            continue
        }

        if (cleaned.includes(curl)) {
            continue
        }

        cleaned.push(curl)

        if (cleaned.length >= App.max_curls) {
            break
        }
    }

    App.set_curlist(cleaned.join(`\n`))
}

App.refresh_curlist = () => {
    let curls = App.get_curls()
    App.set_curlist(curls.join(`\n`))
}

App.update_curlist_top = () => {
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = App.get_curls()
    curlist_top.textContent = `Curls (${curls.length})`
}

App.save_curls = (color, curls) => {
    if (!color) {
        color = App.color_mode
    }

    if (!curls) {
        curls = App.get_curls()
    }

    let saved = App.get_curlist_by_color(color)

    if (App.same_list(curls, saved)) {
        return false
    }

    let name = App.get_curlist_name(color)
    localStorage.setItem(name, JSON.stringify(curls))
    return true
}

App.load_curlist = () => {
    let color = App.color_mode
    let saved = App.get_curlist_by_color(color)
    App.set_curlist(saved.join(`\n`))
}

App.get_curlist_name = (color) => {
    return `curls_${color}`
}

App.get_curlist_by_color = (color) => {
    let name = App.get_curlist_name(color)
    let saved = localStorage.getItem(name) || `[]`

    try {
        return JSON.parse(saved)
    }
    catch (err) {
        return []
    }
}

App.copy_curlist = (e) => {
    let curlist = DOM.el(`#curlist`)
    navigator.clipboard.writeText(curlist.value)
}

App.show_curlist_menu = (e) => {
    let curls = App.get_curls()
    let items

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
    }
    else {
        items = [
            {
                text: `Add`,
                action: () => {
                    App.do_add_curl(`top`)
                }
            },
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
    let curlist = App.get_curlist()
    let lines = curlist.split(`\n`).filter(x => x !== ``)

    if (how === `asc`) {
        lines.sort()
    }
    else if (how === `desc`) {
        lines.sort().reverse()
    }

    App.set_curlist(lines.join(`\n`))
    App.clean_curlist()
    App.save_curls()
    App.sort_if_order()
}

App.export_curlist = () => {
    let curlists = {}

    for (let color in App.colors) {
        let curlist = App.get_curlist_by_color(color)

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

        let current = curlists[App.color_mode]

        if (current) {
            let curlist = curlists[App.color_mode]
            App.set_curlist(curlist.join(`\n`))
        }

        App.update_curlist_top()
        App.update(true)
    }
    catch (err) {
        App.error(err)
        App.set_container_info(`Error: Invalid data`)
    }
}

App.clear_curlists = () => {
    if (confirm(`Clear all curls in all colors?`)) {
        for (let color in App.colors) {
            let name = App.get_curlist_name(color)
            localStorage.setItem(name, ``)
        }

        App.clear_curlist()
    }
}

App.clear_curlist = () => {
    App.set_curlist(``)
    App.update_curlist_top()
    App.empty_container()
}