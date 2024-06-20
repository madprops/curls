const App = {}

App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.update_delay = App.MINUTE * 5
App.updates_enabled = false
App.max_curls = 100
App.max_curl_length = 18
App.server_url = `http://localhost:5000`
App.curlist_enabled = true
App.info_enabled = true
App.last_items = []
App.last_used_curls = []
App.last_missing = []
App.clear_delay = 800

App.colors = {
    red: `rgb(255, 89, 89)`,
    green: `rgb(87, 255, 87)`,
    blue: `rgb(118, 120, 255)`,
    yellow: `rgb(255, 219, 78)`,
    purple: `rgb(193, 56, 255)`,
    white: `rgb(255, 255, 255)`
}

App.setup = () => {
    App.setup_buttons()
    App.setup_curlist()
    App.setup_updater()
    App.setup_container()
    App.setup_sort()
    App.setup_color()
    App.setup_edit()
    App.clean_curlist()
    App.update(true)
}

App.start_update_timeout = () => {
    App.update_timeout = setTimeout(() => {
        App.update()
    }, App.update_delay)
}

App.update = (force = false) => {
    clearTimeout(App.update_timeout)

    if (force || App.updates_enabled) {
        App.update_curls()
    }

    App.start_update_timeout()
}

App.get_used_curls = () => {
    let curls = App.get_curls()

    if (!curls.length) {
        return []
    }

    let used_curls = []

    for (let curl of curls) {
        if (used_curls.length > App.max_curls) {
            break
        }

        curl = curl.trim()

        if (!curl) {
            continue
        }

        if (curl.includes(` `)) {
            continue
        }

        if (curl.length > App.max_curl_length) {
            continue
        }

        if (used_curls.includes(curl)) {
            continue
        }

        used_curls.push(curl)
    }

    return used_curls
}

App.update_curls = async () => {
    App.info(`Updating...`)
    let used_curls = App.get_used_curls()
    App.last_used_curls = used_curls

    if (!used_curls.length) {
        App.empty_container()
        return
    }

    let url = `${App.server_url}/curls`
    let params = new URLSearchParams()

    for (let curl of used_curls) {
        params.append(`curl`, curl);
    }

    App.show_updating()
    let response = ``

    try {
        response = await fetch(url, {
            method: `POST`,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`
            },
            body: params,
        })
    }
    catch (e) {
        App.info(`Error: Failed to update`)
        App.clear_updating()
        return
    }

    let items = await response.json()
    App.insert_items(items)
    App.clear_updating()
}

App.show_updating = () => {
    let button = DOM.el(`#update`)
    clearTimeout(App.clear_updating_timeout)
    button.innerHTML = `Updating`
    button.classList.add(`active`)
}

App.clear_updating = () => {
    App.clear_updating_timeout = setTimeout(() => {
        let button = DOM.el(`#update`)
        button.innerHTML = `Update`
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.show_editing = () => {
    let button = DOM.el(`#edit_submit`)
    clearTimeout(App.clear_editing_timeout)
    button.innerHTML = `Editing`
    button.classList.add(`active`)
}

App.clear_editing = () => {
    App.clear_editing_timeout = setTimeout(() => {
        let button = DOM.el(`#edit_submit`)
        button.innerHTML = `Edit`
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.get_sort = () => {
    let sort = DOM.el(`#sort`)
    return sort.options[sort.selectedIndex].value
}

App.sort_items = (items) => {
    let mode = App.get_sort()

    if (mode === `recent`) {
        items.sort((a, b) => {
            return b.updated.localeCompare(a.updated)
        })
    }
    else if (mode === `order`) {
        let used_curls = App.last_used_curls

        items.sort((a, b) => {
            return used_curls.indexOf(a.curl) - used_curls.indexOf(b.curl)
        })
    }
    else if (mode === `alpha`) {
        items.sort((a, b) => {
            return a.curl.localeCompare(b.curl)
        })
    }
}

App.clear_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

App.empty_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = `Add some curls in the list at the left`
}

App.insert_items = (items) => {
    App.clear_container()
    App.sort_items(items)
    App.last_items = items
    console.log(items)

    for (let item of items) {
        if (!item.status) {
            item.status = `Not updated yet`
        }
    }

    for (let item of items) {
        App.insert_item(item)
    }

    let missing = App.get_missing()
    App.last_missing = missing

    for (let curl of missing) {
        App.insert_item({curl, status: `Not found`, updated: 0})
    }

    window.getSelection().removeAllRanges()
}

App.get_missing = () => {
    let used = App.last_used_curls
    let items = App.last_items
    return used.filter(curl => !items.find(item => item.curl === curl))
}

App.insert_item = (item) => {
    let container = DOM.el(`#container`)
    let el = DOM.create(`div`, `item`)
    let item_icon = DOM.create(`div`, `item_icon`)

    let canvas = DOM.create(`canvas`, `item_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    item_icon.append(canvas)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_status = DOM.create(`div`, `item_status`)
    let item_updated = DOM.create(`div`, `item_updated`)
    item_curl.textContent = item.curl
    item_status.innerHTML = App.sanitize(item.status)
    App.urlize(item_status)

    let date = new Date(item.updated)
    let s_date = dateFormat(date, `dd/mm/yy HH:MM`)
    item_updated.textContent = s_date

    el.append(item_icon)
    el.append(item_curl)
    el.append(item_status)
    el.append(item_updated)
    container.append(el)
    container.append(el)
}

App.get_url = (curl) => {
    return `${App.server_url}/${curl}`
}

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

    let c_saved = localStorage.getItem(`curlist_enabled`)
    App.curlist_enabled = c_saved === `true`

    if (!App.curlist_enabled) {
        App.hide_curlist()
    }

    if (!App.curlist_enabled) {
        App.hide_curlist()
    }

    App.load_curlist()
}

App.clean_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = App.get_curls()
    curls = curls.filter(x => x.match(/^[a-zA-Z0-9_]+$/))
    let cleaned = []

    for (let curl of curls) {
        if (curl.length > App.max_curl_length) {
            continue
        }

        if (cleaned.includes(curl)) {
            continue
        }

        cleaned.push(curl)
    }

    curlist.value = cleaned.join(`\n`)
    curlist_top.textContent = `Curlist (${cleaned.length})`
}

App.save_curlist = () => {
    let curlist = DOM.el(`#curlist`).value

    if (curlist === localStorage.getItem(`curlist`)) {
        return false
    }

    localStorage.setItem(`curlist`, curlist)
    return true
}

App.load_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let saved = localStorage.getItem(`curlist`) || ``
    curlist.value = saved
}

App.setup_buttons = () => {
    let update = DOM.el(`#update`)

    DOM.ev(update, `click`, () => {
        App.update(true)
    })

    let toggle_curlist = DOM.el(`#toggle_curlist`)

    DOM.ev(toggle_curlist, `click`, () => {
        App.toggle_curlist()
    })
}

App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    DOM.ev(sort, `change`, () => {
        App.change_sort()
    })

    let saved = localStorage.getItem(`sort`) || `recent`
    sort.value = saved
}

App.setup_color = () => {
    let color = DOM.el(`#color`)
    let saved = localStorage.getItem(`color`) || `green`
    color.value = saved

    DOM.ev(color, `change`, () => {
        App.change_color()
    })

    App.apply_color()
}

App.change_sort = () => {
    let mode = App.get_sort()
    localStorage.setItem(`sort`, mode)
    App.insert_items(App.last_items)
}

App.change_color = () => {
    let color = App.get_color()
    localStorage.setItem(`color`, color)
    App.apply_color()
}

App.get_color = () => {
    let color = DOM.el(`#color`)
    return color.options[color.selectedIndex].value
}

App.apply_color = () => {
    let color = App.get_color()
    let rgb = App.colors[color]
    document.documentElement.style.setProperty(`--color`, rgb)
}

App.setup_updater = () => {
    let updater = DOM.el(`#updater`)

    DOM.ev(updater, `click`, () => {
        App.change_updater()
    })

    let saved = localStorage.getItem(`updater`) || `minutes_5`
    App.check_updater(saved)
    App.refresh_updater()
}

App.get_updater = () => {
    return localStorage.getItem(`updater`) || `minutes_5`
}

App.check_updater = (saved) => {
    if (saved.startsWith(`minutes_`)) {
        let minutes = parseInt(saved.split(`_`)[1])
        App.update_delay = App.MINUTE * minutes
        App.updates_enabled = true
    }
    else {
        App.updates_enabled = false
    }
}

App.change_updater = () => {
    let saved = App.get_updater()

    if (saved === `minutes_5`) {
        saved = `disabled`
    }
    else {
        saved = `minutes_5`
    }

    localStorage.setItem(`updater`, saved)
    App.check_updater(saved)
    App.refresh_updater()

    if (saved.startsWith(`minutes_`)) {
        App.update(true)
    }
}

App.refresh_updater = () => {
    let el = DOM.el(`#updater`)
    let updater = App.get_updater()

    if (updater === `minutes_5`) {
        el.textContent = `Updating every 5 minutes`
    }
    else {
        el.textContent = `No auto updates`
    }
}

App.show_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    left_side.classList.remove(`hidden`)
}

App.hide_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    left_side.classList.add(`hidden`)
}

App.toggle_curlist = () => {
    if (App.curlist_enabled) {
        App.hide_curlist()
    }
    else {
        App.show_curlist()
    }

    App.curlist_enabled = !App.curlist_enabled
    localStorage.setItem(`curlist_enabled`, App.curlist_enabled)
}

App.edit_curl = () => {
    App.info(`Editing...`)
    let curl = DOM.el(`#edit_curl`).value
    let key = DOM.el(`#edit_key`).value
    let status = DOM.el(`#edit_status`).value

    if (!curl || !key || !status) {
        return
    }

    let url = `${App.server_url}/edit`
    let params = new URLSearchParams()

    params.append(`curl`, curl)
    params.append(`key`, key)
    params.append(`status`, status)

    App.show_editing()

    fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/x-www-form-urlencoded`
        },
        body: params,
    })
    .then(response => response.text())
    .then(ans => {
        App.info(ans)
        App.clear_status()
        App.update(true)
        App.clear_editing()

        if (ans === `ok`) {
            App.add_owned_curl(curl)
        }
    })
    .catch(e => {
        App.info(`Error: Failed to edit`)
        App.clear_editing()
    })
}

App.clear_status = () => {
    DOM.el(`#edit_status`).value = ``
}

App.sanitize = (s) => {
    return s.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
}

App.urlize = (el) => {
    let html = el.innerHTML
    let urlRegex = /(https?:\/\/[^\s]+)/g
    let replacedText = html.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`)
    el.innerHTML = replacedText
}

App.setup_edit = () => {
    let curl = DOM.el(`#edit_curl`)

    DOM.ev(curl, `focusout`, (e) => {
        App.save_edit()
    })

    let key = DOM.el(`#edit_key`)

    DOM.ev(key, `focusout`, (e) => {
        App.save_edit()
    })

    let status = DOM.el(`#edit_status`)

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `Enter`) {
            App.edit_curl()
        }
    })

    let submit = DOM.el(`#edit_submit`)

    DOM.ev(submit, `click`, () => {
        App.edit_curl()
    })

    App.load_edit()
}

App.save_edit = () => {
    let curl = DOM.el(`#edit_curl`).value
    let key = DOM.el(`#edit_key`).value
    localStorage.setItem(`edit_curl`, curl)
    localStorage.setItem(`edit_key`, key)
}

App.load_edit = () => {
    let curl = DOM.el(`#edit_curl`)
    let key = DOM.el(`#edit_key`)
    curl.value = localStorage.getItem(`edit_curl`) || ``
    key.value = localStorage.getItem(`edit_key`) || ``
}

App.setup_container = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        let icon = e.target.closest(`.item_icon`)

        if (icon) {
            App.show_item_menu(e)
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        let icon = e.target.closest(`.item_icon`)

        if (icon) {
            e.preventDefault()
            App.show_item_menu(e)
        }
    })
}

App.show_item_menu = (e) => {
    let items = [
        {
            text: `Copy`,
            action: () => {
                App.copy_item(e)
            }
        },
        {
            text: `Remove`,
            action: () => {
                App.remove_curl(e)
            }
        },
        {
            text: `To Top`,
            action: () => {
                App.curl_to_top(e)
            }
        },
        {
            text: `To Bottom`,
            action: () => {
                App.curl_to_bottom(e)
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.curl_to_top = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl)
    App.do_add_curl(`top`, curl)
}

App.curl_to_bottom = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl)
    App.do_add_curl(`bottom`, curl)
}

App.remove_a_curl = () => {
    let curl = prompt(`Remove a curl:`)

    if (!curl) {
        return
    }

    App.do_remove_curl(curl)
}

App.remove_curl = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent

    if (confirm(`Remove ${curl}?`)) {
        App.do_remove_curl(curl)
    }
}

App.do_remove_curl = (curl) => {
    let curls = App.get_curls()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl)
        }
    }

    curlist.value = cleaned.join(`\n`)

    if (App.save_curlist()) {
        App.update(true)
    }
}

App.copy_item = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    let status = item.querySelector(`.item_status`).textContent
    let updated = item.querySelector(`.item_updated`).textContent
    let msg = `${curl}\n${status}\n${updated}`
    navigator.clipboard.writeText(msg)

    let icon = item.querySelector(`.item_icon`)
    icon.classList.add(`blink`)

    setTimeout(() => {
        icon.classList.remove(`blink`)
    }, 1000)
}

App.info = (msg) => {
    if (App.info_enabled) {
        console.info(msg)
    }
}

App.show_curlist_menu = (e) => {
    let items = [
        {
            text: `Copy`,
            action: () => {
                App.copy_curlist(e)
            }
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
            text: `Remove`,
            action: () => {
                App.remove_a_curl()
            }
        },
        {
            text: `Clean`,
            action: () => {
                App.curlist_clean()
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.copy_curlist = (e) => {
    let curlist = DOM.el(`#curlist`)
    navigator.clipboard.writeText(curlist.value)
}

App.do_add_curl = (where, curl = ``) => {
    if (!curl) {
        curl = prompt(`Add a curl:`)

        if (!curl) {
            return
        }
    }

    let curlist = DOM.el(`#curlist`)

    if (where === `top`) {
        curlist.value = `${curl}\n${curlist.value}`
    }
    else if (where === `bottom`) {
        curlist.value += `\n${curl}`
    }

    App.clean_curlist()

    if (App.save_curlist()) {
        App.update(true)
    }
}

App.curlist_clean = () => {
    if (confirm(`Remove the curls that were not found?`)) {
        App.remove_not_found()
    }
}

App.remove_not_found = () => {
    let missing = App.last_missing
    let curlist = DOM.el(`#curlist`)
    let curls = App.get_curls()
    let cleaned = []

    for (let curl of curls) {
        if (!missing.includes(curl)) {
            cleaned.push(curl)
        }
    }

    curlist.value = cleaned.join(`\n`)
    App.clean_curlist()

    if (App.save_curlist()) {
        App.update(true)
    }
}

App.add_owned_curl = (curl) => {
    let curls = App.get_curls()

    if (!curls.includes(curl)) {
        App.do_add_curl(`top`, curl)
    }
}

App.get_curls = () => {
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)
    return lines
}