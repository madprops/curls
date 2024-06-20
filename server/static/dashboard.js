const App = {}

App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.update_delay = App.MINUTE * 5
App.updates_enabled = false
App.max_curls = 100
App.max_curl_length = 18
App.server_url = `http://localhost:5000`
App.last_items = []
App.curlist_enabled = true
App.print_enabled = true

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
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)

    if (!lines.length) {
        return []
    }

    let used_curls = []

    for (let line of lines) {
        if (used_curls.length > App.max_curls) {
            break
        }

        let curl = line.trim()

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
    App.print(`Updating...`)
    let used_curls = App.get_used_curls()

    if (!used_curls.length) {
        App.empty_container()
        return
    }

    let url = `${App.server_url}/curls`
    let params = new URLSearchParams()

    for (let curl of used_curls) {
        params.append(`curl`, curl);
    }

    let response = await fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/x-www-form-urlencoded`
        },
        body: params,
    })

    let items = await response.json()
    App.insert_items(items)

    let missing = used_curls.filter(curl => !items.find(item => item.curl === curl))

    for (let curl of missing) {
        App.insert_item({curl, content: `Not found.`, updated: 0})
    }
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
        let used_curls = App.get_used_curls()

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

    for (let item of items) {
        if (!item.content) {
            item.content = `Not updated yet.`
        }
    }

    for (let item of items) {
        App.insert_item(item)
    }
}

App.insert_item = (item) => {
    let container = DOM.el(`#container`)
    let el = DOM.create(`div`, `item`)

    let item_icon = DOM.create(`canvas`, `item_icon`)
    item_icon.title = `Copy to clipboard`
    item_icon.width = 20
    item_icon.height = 20
    jdenticon.update(item_icon, item.curl)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_content = DOM.create(`div`, `item_content`)
    let item_updated = DOM.create(`div`, `item_updated`)
    item_curl.textContent = item.curl
    item_content.innerHTML = App.sanitize(item.content)
    App.urlize(item_content)

    let date = new Date(item.updated)
    let s_date = dateFormat(date, `dd/mm/yy HH:MM`)
    item_updated.textContent = s_date

    el.append(item_icon)
    el.append(item_curl)
    el.append(item_content)
    el.append(item_updated)
    container.append(el)
    container.append(el)
}

App.get_url = (curl) => {
    return `${App.server_url}/${curl}`
}

App.setup_curlist = () => {
    let curlist = DOM.el(`#curlist`)

    DOM.ev(curlist, `focusout`, () => {
        App.clean_curlist()
        App.save_curlist()
    })

    App.load_curlist()
}

App.clean_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let lines = curlist.value.split(`\n`).filter(x => x !== ``)
    let cleaned = []

    for (let line of lines) {
        if (!cleaned.includes(line)) {
            cleaned.push(line)
        }
    }

    curlist.value = cleaned.join(`\n`)
}

App.save_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    localStorage.setItem(`curlist`, curlist.value)
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

    let curlist_top = DOM.el(`#curlist_top`)

    DOM.ev(curlist_top, `click`, () => {
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

App.toggle_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    let curlist_top = DOM.el(`#curlist_top`)
    let curlist = DOM.el(`#curlist`)

    if (App.curlist_enabled) {
        curlist.classList.add(`hidden`)
        curlist_top.textContent = `>`
        left_side.style.width = `unset`
    }
    else {
        curlist.classList.remove(`hidden`)
        curlist_top.textContent = `List of curls`
        left_side.style.width = `200px`
    }

    App.curlist_enabled = !App.curlist_enabled
}

App.edit_curl = () => {
    let curl = DOM.el(`#edit_curl`).value
    let key = DOM.el(`#edit_key`).value
    let content = DOM.el(`#edit_content`).value

    if (!curl || !key || !content) {
        return
    }

    let url = `${App.server_url}/edit`

    let params = new URLSearchParams()
    params.append("curl", curl)
    params.append("key", key)
    params.append("content", content)

    fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/x-www-form-urlencoded`
        },
        body: params,
    })
    .then(response => response.text())
    .then(text => {
        App.print(text)
        App.clear_content()
        App.update(true)
    })
}

App.clear_content = () => {
    DOM.el(`#edit_content`).value = ``
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

    let content = DOM.el(`#edit_content`)

    DOM.ev(content, `keyup`, (e) => {
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
            App.copy_item(e)
        }
    })
}

App.copy_item = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    let content = item.querySelector(`.item_content`).textContent
    let updated = item.querySelector(`.item_updated`).textContent
    let msg = `${curl}\n${content}\n${updated}`
    navigator.clipboard.writeText(msg)
    App.print(`Copied!`)

    let icon = item.querySelector(`.item_icon`)
    icon.classList.add(`blink`)

    setTimeout(() => {
        icon.classList.remove(`blink`)
    }, 1000)
}

App.print = (msg) => {
    if (App.print_enabled) {
        console.info(msg)
    }
}