App.setup_updater = () => {
    let updater = DOM.el(`#updater`)
    App.updater_mode = App.load_updater()

    Combo.register({
        title: `Update Modes`,
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

    App.update_debouncer = App.create_debouncer((args) => {
        App.do_update(args)
    }, App.update_debouncer_delay)

    App.check_updater()
}

App.load_updater = () => {
    return App.load_modes(`updater`, App.updater_modes, App.default_updater)
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

App.update = (args) => {
    App.update_debouncer.call(args)
}

App.do_update = (args = {}) => {
    clearTimeout(App.update_timeout)

    let def_args = {
        feedback: true,
        curls: [],
    }

    App.def_args(def_args, args)
    App.update_curls(args)
    App.restart_update()
}

App.update_curls = async (args) => {
    App.info(`Update: Trigger`)

    if (App.updating) {
        App.error(`Slow down`)
        return
    }

    let add = false

    if (args.curls.length) {
        add = true
    }
    else {
        args.curls = App.get_curls()
    }

    if (!args.curls.length) {
        App.empty_container()
        return
    }

    let url = `/curls`
    let params = new URLSearchParams()

    for (let curl of args.curls) {
        params.append(`curl`, curl);
    }

    if (args.feedback) {
        App.show_updating()
    }

    let response = ``
    App.updating = true
    App.info(`Update: Request ${App.network} (${args.curls.length})`)

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
            App.add_items(items, args.curls)
        }
        else {
            App.insert_items(items)
        }
    }
    catch (e) {
        App.error(`Failed to parse response`)
        App.error(e)
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
        App.update()
        return
    }

    App.updater_mode = mode
    localStorage.setItem(`updater`, mode)
    App.check_updater()
}

App.disable_updates = () => {
    App.change_updater(`disabled`)
}