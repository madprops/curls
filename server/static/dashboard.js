const App = {}
App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.update_delay = App.MINUTE * 5
App.max_curls = 100
App.max_curl_length = 18
App.server_url = `http://localhost:5000`

App.setup = () => {
    App.setup_buttons()
    App.setup_container()
    App.setup_curlist()
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

App.update_curls = async () => {
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)
    let container = DOM.el(`#container`)
    container.innerHTML = ``

    if (!lines.length) {
        return
    }

    let used_curls = []

    for (let line of lines) {
        if (used_curls.length > App.max_curls) {
            return
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

    if (!used_curls.length) {
        return
    }

    let url = `${App.server_url}/curls`

    let response = await fetch(url, {
        method: `POST`,
        headers: {
            'Content-Type': `application/json`
        },
        body: JSON.stringify({curls: used_curls})
    })

    let items = await response.json()

    items.sort((a, b) => {
        return a.updated - b.updated
    })

    console.log(items)
}

App.insert_item = (curl, content) => {
    if (!curl || !content) {
        return
    }

    let container = DOM.el(`#container`)
    let text = `${curl}: ${content}`
    let el = DOM.create(`div`, `item`)
    el.textContent = text
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
    let saved = localStorage.getItem(`curlist`)

    if (saved) {
        curlist.value = saved
    }
}

App.setup_buttons = () => {
    let update = DOM.el(`#update`)

    DOM.ev(update, `click`, () => {
        App.update()
    })
}

App.setup_container = () => {
    let container = DOM.el(`#container`)
    Sortable.create(container)
}