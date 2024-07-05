/*

Update manager

*/

const Update = {
    default_mode: `minutes_5`,
    enabled: false,
    delay: App.MINUTE * 5,
    debouncer_delay: 250,
    updating: false,
    clear_delay: 800,
    ls_name: `update`,
}

Update.modes = [
    {value: `now`, name: `Update`, skip: true, info: `Update now`},
    {value: App.separator},
    {value: `minutes_1`, name: `1 Minute`, info: `Update automatically every minute`},
    {value: `minutes_5`, name: `5 Minutes`, info: `Update automatically every 5 minutes`},
    {value: `minutes_10`, name: `10 Minutes`, info: `Update automatically every 10 minutes`},
    {value: `minutes_30`, name: `30 Minutes`, info: `Update automatically every 30 minutes`},
    {value: `minutes_60`, name: `60 Minutes`, info: `Update automatically every hour`},
    {value: App.separator},
    {value: `disabled`, name: `Disabled`},
]

Update.setup = () => {
    let updater = DOM.el(`#updater`)
    Update.mode = Update.load_update()

    Combo.register({
        title: `Update Modes`,
        items: Update.modes,
        value: Update.mode,
        element: updater,
        default: Update.default_mode,
        action: (value) => {
            Update.change(value)
        },
        get: () => {
            return Update.mode
        },
    })

    Update.debouncer = Utils.create_debouncer((args) => {
        Update.do_update(args)
    }, Update.debouncer_delay)

    Update.check()
}

Update.load_update = () => {
    return Utils.load_modes(Update.ls_name, Update.modes, Update.default_mode)
}

Update.check = () => {
    let mode = Update.mode

    if (mode.startsWith(`minutes_`)) {
        let minutes = parseInt(mode.split(`_`)[1])
        Update.delay = App.MINUTE * minutes
        Update.enabled = true
    }
    else {
        Update.enabled = false
    }

    Update.restart()
}

Update.restart = () => {
    clearTimeout(Update.timeout)

    if (Update.enabled) {
        Update.start_timeout()
    }
}

Update.start_timeout = () => {
    Update.timeout = setTimeout(() => {
        Update.update()
    }, Update.delay)
}

Update.update = (args) => {
    Update.debouncer.call(args)
}

Update.do_update = (args = {}) => {
    Update.debouncer.cancel()
    clearTimeout(App.timeout)

    let def_args = {
        feedback: true,
        curls: [],
        update_curlist: false,
    }

    Utils.def_args(def_args, args)
    Update.fetch(args)
    Update.restart()
}

Update.fetch = async (args) => {
    Utils.info(`Update: Trigger`)

    if (Update.updating) {
        Utils.error(`Slow down`)
        return
    }

    let add = false

    if (args.curls.length) {
        add = true
    }
    else {
        args.curls = Curls.get()
    }

    if (!args.curls.length) {
        Container.empty()
        return
    }

    let url = `/curls`
    let params = new URLSearchParams()

    for (let curl of args.curls) {
        params.append(`curl`, curl);
    }

    if (args.feedback) {
        Update.show_updating()
    }

    let response = ``
    Update.updating = true
    Utils.info(`Update: Request ${App.network} (${args.curls.length})`)

    if (!Items.list.length) {
        Container.loading()
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
        Utils.error(`Failed to update`)
        App.clear()
        return
    }

    if (args.update_curlist) {
        Curlist.update()
    }

    try {
        let items = await response.json()

        if (add) {
            Container.add(items, args.curls)
        }
        else {
            Container.insert(items)
        }
    }
    catch (e) {
        Utils.error(`Failed to parse response`)
        Utils.error(e)
    }

    Update.clear()
}

Update.show_updating = () => {
    let button = DOM.el(`#updater`)
    clearTimeout(Update.clear_timeout)
    button.classList.add(`active`)
}

Update.clear = () => {
    Update.updating = false

    Update.clear_timeout = setTimeout(() => {
        let button = DOM.el(`#updater`)
        button.classList.remove(`active`)
    }, Update.clear_delay)
}

Update.change = (mode) => {
    if (mode === `now`) {
        Update.update()
        return
    }

    Update.mode = mode
    Utils.save(Update.ls_name, mode)
    Update.check()
}