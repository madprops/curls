/*

Update manager

*/

class Update {
    static default_mode = `minutes_5`
    static enabled = false
    static delay = Utils.MINUTE * 5
    static debouncer_delay = 250
    static updating = false
    static clear_delay = 800
    static ls_name = `update`
    static last_update = 0

    static modes = [
        {value: `now`, name: `Update`, skip: true, info: `Update now`},
        {value: Utils.separator},
        {value: `minutes_1`},
        {value: `minutes_5`},
        {value: `minutes_10`},
        {value: `minutes_20`},
        {value: `minutes_30`},
        {value: `minutes_60`},
        {value: Utils.separator},
        {value: `disabled`, name: `Disabled`, info: `Do not update automatically`},
    ]

    static setup() {
        let updater = DOM.el(`#updater`)
        this.mode = this.load_update()
        this.fill_modes()

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

        this.debouncer = Utils.create_debouncer(async (args) => {
            await this.do_update(args)
            this.restart()
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
            this.delay = Utils.MINUTE * minutes
            this.enabled = true
        }
        else {
            this.enabled = false
        }

        this.restart()
    }

    static restart() {
        console.log(444)
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

    static async do_update(args = {}) {
        this.debouncer.cancel()

        let def_args = {
            curls: [],
        }

        Utils.def_args(def_args, args)
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
            args.curls = Curls.get_curls()
        }

        if (!args.curls.length) {
            Container.show_empty()
            return
        }

        let url = `/curls`
        let params = new URLSearchParams()

        for (let curl of args.curls) {
            params.append(`curl`, curl);
        }

        this.show_updating()
        let response = ``
        this.updating = true
        Utils.info(`Update: Request ${Utils.network} (${args.curls.length})`)

        if (!Items.list.length) {
            Container.show_loading()
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
            this.hide_updating()
            return
        }

        try {
            let items = await response.json()
            this.last_update = Utils.now()

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

        this.hide_updating()
    }

    static show_updating() {
        let button = DOM.el(`#updater`)
        clearTimeout(this.clear_timeout)
        button.classList.add(`active`)
    }

    static hide_updating() {
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

    static fill_modes() {
        for (let mode of this.modes) {
            if (mode.value.startsWith(`minutes_`)) {
                let minutes = parseInt(mode.value.split(`_`)[1])
                let word = Utils.plural(minutes, `minute`, `minutes`)
                mode.name = `${minutes} ${word}`
                mode.info = `Update automatically every ${minutes} ${word}`
            }
        }
    }
}