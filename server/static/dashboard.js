const App = {}
App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.update_delay = App.MINUTE * 5
App.max_curls = 100
App.max_curl_length = 18
App.server_url = `http://localhost:5000`
App.last_items = []

App.setup = () => {
    App.setup_buttons()
    App.setup_curlist()
    App.setup_sort()
    App.setup_color()
    App.update()
}

App.start_update_timeout = () => {
    App.update_timeout = setTimeout(() => {
        App.update()
    }, App.update_delay)
}

App.update = () => {
    clearTimeout(App.update_timeout)
    App.update_curls()
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
    let used_curls = App.get_used_curls()

    if (!used_curls.length) {
        return
    }

    let url = `${App.server_url}/curls`

    let response = await fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/json`
        },
        body: JSON.stringify({curls: used_curls})
    })

    let items = await response.json()
    App.insert_items(items)
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

App.insert_items = (items) => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``

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
    item_icon.width = 20
    item_icon.height = 20
    jdenticon.update(item_icon, item.curl)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_content = DOM.create(`div`, `item_content`)
    let item_updated = DOM.create(`div`, `item_updated`)
    item_curl.textContent = item.curl
    item_content.textContent = item.content
    item_updated.textContent = new Date(item.updated).toLocaleString()
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
        App.update()
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
    let rgb

    if (color === `red`) {
        rgb = `rgb(255, 89, 89)`
    }
    else if (color === `green`) {
        rgb = `rgb(87, 255, 87)`
    }
    else if (color === `blue`) {
        rgb = `rgb(118, 120, 255)`
    }
    else if (color === `yellow`) {
        rgb = `rgb(255, 219, 78)`
    }
    else if (color === `purple`) {
        rgb = `rgb(193, 56, 255)`
    }
    else if (color === `white`) {
        rgb = `rgb(255, 255, 255)`
    }
    else {
        rgb = `rgb(255, 255, 255)`
    }

    document.documentElement.style.setProperty(`--color`, rgb)
}