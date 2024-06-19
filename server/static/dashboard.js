const App = {}
App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.update_delay = App.MINUTE * 5
App.server_url = `http://localhost:5000`

App.setup = () => {
    // DOM.ev(DOM.el(`#set_button`), `click`, () => {
    //     App.set_curls()
    // })

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

App.update_curls = () => {
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)
    let container = DOM.el(`#container`)
    container.innerHTML = ``

    if (!lines.length) {
        return
    }

    for (let line of lines) {
        curl = line.trim()

        if (!curl) {
            continue
        }

        if (curl.includes(` `)) {
            continue
        }

        fetch(App.get_url(curl))
        .then(response => response.text())
        .then(data => {
            let text = `${curl}: ${data}`

            if (text) {
                let el = DOM.create(`div`, `item`)
                el.textContent = text
                container.append(el)
            }
        })
    }
}

App.get_url = (curl) => {
    return `${App.server_url}/${curl}`
}