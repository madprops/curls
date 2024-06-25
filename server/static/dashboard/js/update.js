App.setup_updater = () => {
    let updater = DOM.el(`#updater`)

    DOM.ev(updater, `click`, () => {
        App.change_updater()
    })

    DOM.ev(updater, `auxclick`, (e) => {
        if (e.button === 1) {
            App.disable_updates()
        }
    })

    DOM.ev(updater, `wheel`, (e) => {
        let direction = App.wheel_direction(e)
        App.cycle_updater(direction)
    })

    App.update_debouncer = App.create_debouncer((force, feedback) => {
        App.do_update(force, feedback)
    }, App.update_debouncer_delay)

    App.load_updater()
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

    App.restart_update()
}

App.restart_update = () => {
    clearTimeout(App.update_timeout)

    if (App.updates_enabled) {
        App.start_update_timeout()
    }
}

App.change_updater = () => {
    let saved = App.get_updater()
    saved = App.switch_state(saved, App.update_modes)
    localStorage.setItem(`updater`, saved)
    App.check_updater(saved)
    App.refresh_updater()
}

App.refresh_updater = () => {
    let el = DOM.el(`#updater`)
    let updater = App.get_updater()

    if (updater.startsWith(`minutes_`)) {
        let num = parseInt(updater.split(`_`)[1])
        let word = App.plural(num, `minute`, `minutes`)
        el.textContent = `Updating every ${num} ${word}`
    }
    else {
        el.textContent = `No auto updates`
    }
}

App.start_update_timeout = () => {
    App.update_timeout = setTimeout(() => {
        App.update()
    }, App.update_delay)
}

App.update = (force, feedback) => {
    App.update_debouncer.call(force, feedback)
}

App.do_update = (force = false, feedback = true) => {
    clearTimeout(App.update_timeout)

    if (force || App.updates_enabled) {
        App.update_curls(feedback)
    }

    App.restart_update()
}

App.update_curls = async (feedback = true) => {
    App.info(`Update: Trigger`)

    if (App.updating) {
        App.error(`Slow down`)
        return
    }

    let used_curls = App.get_used_curls()
    App.last_used_curls = used_curls

    if (!used_curls.length) {
        App.empty_container()
        return
    }

    let url = `/curls`
    let params = new URLSearchParams()

    for (let curl of used_curls) {
        params.append(`curl`, curl);
    }

    if (feedback) {
        App.show_updating()
    }

    let response = ``
    App.updating = true
    App.info(`Update: Request ${App.network}`)
    App.container_loading()

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
        App.error(`Failed to update`)
        App.clear_updating()
        return
    }

    try {
        let items = await response.json()
        App.insert_items(items)
    }
    catch (e) {
        App.error(`Failed to parse response`)
    }

    App.clear_updating()
}

App.show_updating = () => {
    let button = DOM.el(`#update`)
    clearTimeout(App.clear_updating_timeout)
    button.classList.add(`active`)
}

App.clear_updating = () => {
    App.updating = false

    App.clear_updating_timeout = setTimeout(() => {
        let button = DOM.el(`#update`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.set_updater = (what) => {
    localStorage.setItem(`updater`, what)
    App.check_updater(what)
    App.refresh_updater()
}

App.load_updater = () => {
    let saved = localStorage.getItem(`updater`) || `minutes_5`
    App.set_updater(saved)
}

App.disable_updates = () => {
    App.set_updater(`disabled`)
}

App.cycle_updater = (direction) => {
    let saved = App.get_updater()
    let reverse = direction === `up`
    saved = App.switch_state(saved, App.update_modes, reverse)
    App.set_updater(saved)
}