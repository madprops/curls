/*

Update manager

*/

class Update {
    static default_mode = `minutes_5`
    static enabled = false
    static delay = App.MINUTE * 5
    static debouncer_delay = 250
    static updating = false
    static clear_delay = 800
    static ls_name = `update`

    static modes = [
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

    static setup() {
        let updater = DOM.el(`#updater`)
        this.mode = this.load_update()

        this.combo = new Combo({
            title: `Update Modes`,
            items: this.modes,
            value: this.mode,
            element: updater,
            default: this.default_mode,
            action: (value) => {
                this.change(value)
            },
            get: () => {
                return this.mode
            },
        })

        this.debouncer = Utils.create_debouncer((args) => {
            this.do_update(args)
        }, this.debouncer_delay)

        this.check()
    }

    static load_update() {
        return Utils.load_modes(this.ls_name, this.modes, this.default_mode)
    }

    static check() {
        let mode = this.mode

        if (mode.startsWith(`minutes_`)) {
            let minutes = parseInt(mode.split(`_`)[1])
            this.delay = App.MINUTE * minutes
            this.enabled = true
        }
        else {
            this.enabled = false
        }

        this.restart()
    }

    static restart() {
        clearTimeout(this.timeout)

        if (this.enabled) {
            this.start_timeout()
        }
    }

    static start_timeout() {
        this.timeout = setTimeout(() => {
            this.update()
        }, this.delay)
    }

    static update(args) {
        this.debouncer.call(args)
    }

    static do_update(args = {}) {
        this.debouncer.cancel()
        clearTimeout(App.timeout)

        let def_args = {
            feedback: true,
            curls: [],
        }

        Utils.def_args(def_args, args)
        this.fetch(args)
        this.restart()
    }

    static async fetch(args) {
        Utils.info(`Update: Trigger`)

        if (this.updating) {
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
            this.show_updating()
        }

        let response = ``
        this.updating = true
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

        this.clear()
    }

    static show_updating() {
        let button = DOM.el(`#updater`)
        clearTimeout(this.clear_timeout)
        button.classList.add(`active`)
    }

    static clear() {
        this.updating = false

        this.clear_timeout = setTimeout(() => {
            let button = DOM.el(`#updater`)
            button.classList.remove(`active`)
        }, this.clear_delay)
    }

    static change(mode) {
        if (mode === `now`) {
            this.update()
            return
        }

        this.mode = mode
        Utils.save(this.ls_name, mode)
        this.check()
    }
}