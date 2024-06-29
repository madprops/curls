App.setup_updater = () => {
    let updater = DOM.el(`#updater`)

    let lines = [
        `Click to pick updater`,
        `Wheel to cycle updaters`,
        `Middle Click to reset`,
    ]

    updater.title = lines.join(`\n`)
    App.updater_mode = App.load_updater()

    Combo.register({
        items: App.updater_modes,
        value: App.updater_mode,
        element: updater,
        default: App.default_updater,
        action: (value) => {
            App.change_updater(value)
        },
        get: () => {
            return App.updater_mode
        },
    })

    App.update_debouncer = App.create_debouncer((force, feedback, curls) => {
        App.do_update(force, feedback, curls)
    }, App.update_debouncer_delay)

    App.check_updater()
}

App.load_updater = () => {
    let saved = localStorage.getItem(`updater`) || App.default_updater
    let values = App.clean_modes(App.updater_modes).map(x => x.value)

    if (!values.includes(saved)) {
        saved = App.default_updater
    }

    return saved
}

App.check_updater = () => {
    let mode = App.updater_mode

    if (mode.startsWith(`minutes_`)) {
        let minutes = parseInt(mode.split(`_`)[1])
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

App.start_update_timeout = () => {
    App.update_timeout = setTimeout(() => {
        App.update()
    }, App.update_delay)
}

App.update = (force, feedback, curls) => {
    App.update_debouncer.call(force, feedback, curls)
}

App.do_update = (force = false, feedback = true, curls = []) => {
    clearTimeout(App.update_timeout)

    if (force || App.updates_enabled) {
        App.update_curls(feedback, curls)
    }

    App.restart_update()
}

App.update_curls = async (feedback = true, curls = []) => {
    App.info(`Update: Trigger`)

    if (App.updating) {
        App.error(`Slow down`)
        return
    }

    let add = false

    if (curls.length) {
        add = true
    }
    else {
        curls = App.get_used_curls()
    }

    if (!curls.length) {
        App.empty_container()
        return
    }

    let url = `/curls`
    let params = new URLSearchParams()

    for (let curl of curls) {
        params.append(`curl`, curl);
    }

    if (feedback) {
        App.show_updating()
    }

    let response = ``
    App.updating = true
    App.info(`Update: Request ${App.network} (${curls.length})`)

    if (!App.items.length) {
        App.container_loading()
    }

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

        if (add) {
            App.insert_items(App.items.concat(items))
        }
        else {
            App.insert_items(items)
        }
    }
    catch (e) {
        App.error(`Failed to parse response`)
    }

    App.clear_updating()
}

App.show_updating = () => {
    let button = DOM.el(`#updater`)
    clearTimeout(App.clear_updating_timeout)
    button.classList.add(`active`)
}

App.clear_updating = () => {
    App.updating = false

    App.clear_updating_timeout = setTimeout(() => {
        let button = DOM.el(`#updater`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.change_updater = (mode) => {
    if (mode === `now`) {
        App.update(true)
        return
    }

    App.updater_mode = mode
    localStorage.setItem(`updater`, mode)
}

App.disable_updates = () => {
    App.change_updater(`disabled`)
}