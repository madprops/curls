App.setup_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)

    DOM.ev(curlist, `focusout`, () => {
        App.clean_curlist()

        if (App.save_curlist()) {
            App.update(true)
        }
    })

    DOM.ev(curlist_top, `click`, (e) => {
        App.show_curlist_menu(e)
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
}

App.get_curlist = () => {
    return DOM.el(`#curlist`).value
}

App.clean_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)
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

    curlist.value = cleaned.join(`\n`)
    curlist_top.textContent = `Curls (${cleaned.length})`
}

App.save_curlist = () => {
    let curlist = DOM.el(`#curlist`).value
    let color = App.get_color()
    let name = `curlist_${color}`

    if (curlist === localStorage.getItem(name)) {
        return false
    }

    localStorage.setItem(name, curlist)
    return true
}

App.load_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let color = App.get_color()
    let name = `curlist_${color}`
    let saved = localStorage.getItem(name) || ``
    curlist.value = saved
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
            },
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

    DOM.el(`#curlist`).value = lines.join(`\n`)
    App.clean_curlist()
    App.save_curlist()
    App.sort_if_order()
}