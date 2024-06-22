App.setup_updater = () => {
    let updater = DOM.el(`#updater`)

    DOM.ev(updater, `click`, () => {
        App.change_updater()
    })

    let saved = localStorage.getItem(`updater`) || `minutes_5`
    App.check_updater(saved)
    App.refresh_updater()

    App.update_debouncer = App.create_debouncer((force, feedback) => {
        App.do_update(force, feedback)
    }, App.update_debouncer_delay)
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

    App.start_update_timeout()
}

App.update_curls = async (feedback = true) => {
    App.info(`Update: Trigger`)

    if (App.updating) {
        App.info(`Slow down`)
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
    App.info(`Update: Request`)

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

    try {
        let items = await response.json()
        App.insert_items(items)
    }
    catch (e) {
        App.info(`Error: Failed to parse response`)
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