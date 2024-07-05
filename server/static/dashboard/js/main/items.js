/*

This manages the item list

*/

class ItemsClass {
    constructor () {
        this.list = []
    }

    get (curl) {
        return this.list.find(item => item.curl === curl)
    }

    find_missing () {
        let used = Curls.get()
        let curls = used.filter(curl => !this.list.find(item => item.curl === curl))
        let missing = []

        for (let curl of curls) {
            missing.push({curl: curl, status: `Not found`, updated: `0`, missing: true})
        }

        return missing
    }

    get_missing () {
        return this.list.filter(item => item.missing)
    }

    get_owned () {
        let picker_items = Picker.get_items()

        return this.list.filter(item => picker_items.find(
            picker => picker.curl === item.curl))
    }

    get_by_date (what) {
        let cleaned = []
        let now = Utils.now()

        for (let item of this.list) {
            let date = new Date(item.updated + `Z`)
            let diff = now - date

            if (diff < what) {
                cleaned.push(item)
            }
        }

        return cleaned
    }

    get_today () {
        return this.get_by_date(App.DAY)
    }

    get_week () {
        return this.get_by_date(App.WEEK)
    }

    get_month () {
        return this.get_by_date(App.MONTH)
    }

    reset () {
        this.list = []
    }

    add_dates () {
        for (let item of this.list) {
            let date = new Date(item.updated + `Z`)
            let date_mode = Container.get_date_mode()
            let s_date

            if (date_mode === `12`) {
                s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
            }
            else if (date_mode === `24`) {
                s_date = dateFormat(date, `dd/mmm/yy - HH:MM`)
            }

            item.updated_text = s_date
        }
    }

    copy (curl) {
        function blink (icon) {
            if (!icon) {
                return
            }

            icon.classList.add(`blink`)

            setTimeout(() => {
                icon.classList.remove(`blink`)
            }, 1000)
        }

        let curls = Curlist.get_selected_curls()

        if (!curls.includes(curl)) {
            curls = [curl]
        }

        let msgs = []

        for (let curl of curls) {
            let item = this.get(curl)
            msgs.push(`${item.curl}\n${item.status}\n${item.updated_text}`)

            if (Peek.open && Peek.curl === curl) {
                blink(DOM.el(`#peek .peek_icon`))
            }

            blink(DOM.el(`.item_icon`, item.element))
        }

        let msg = msgs.join(`\n\n`)
        Utils.copy_to_clipboard(msg)
    }

    show_menu (args = {}) {
        let def_args = {
            from: `curlist`,
        }

        Utils.def_args(def_args, args)
        let selected = []

        if (args.from === `curlist`) {
            selected = Curlist.get_selected_items()
            let item = Curlist.extract_item(args.e.target)

            if (!selected.length || !selected.includes(item)) {
                Curlist.select_item(item)
                selected = []
            }
        }

        let items = []
        let curls = Curlist.get_selected_curls()

        if (selected.length > 1) {
            items = [
                {
                    text: `Copy`,
                    action: () => {
                        this.copy(args.curl)
                    }
                },
                {
                    text: `Move`,
                    action: () => {
                        Colors.move(curls, args.e)
                    }
                },
                {
                    text: `Remove`,
                    action: () => {
                        Curls.remove_selected()
                    }
                },
                {
                    separator: true,
                },
                {
                    text: `To Top`,
                    action: () => {
                        Curls.to_top(curls)
                    }
                },
                {
                    text: `To Bottom`,
                    action: () => {
                        Curls.to_bottom(curls)
                    }
                },
            ]
        }
        else {
            items = [
                {
                    text: `Copy`,
                    action: () => {
                        this.copy(args.curl)
                    }
                },
                {
                    text: `Edit`,
                    action: () => {
                        Curls.edit(args.curl)
                    }
                },
                {
                    text: `Move`,
                    action: () => {
                        Colors.move([args.curl], args.e)
                    }
                },
                {
                    text: `Remove`,
                    action: () => {
                        Curls.remove([args.curl])
                    }
                },
                {
                    separator: true,
                },
                {
                    text: `To Top`,
                    action: () => {
                        Curls.to_top([args.curl])
                    }
                },
                {
                    text: `To Bottom`,
                    action: () => {
                        Curls.to_bottom([args.curl])
                    }
                },
            ]

            if (args.from === `container`) {
                items.push({
                    separator: true,
                })

                items.push({
                    text: `Peek`,
                    action: () => {
                        Peek.show({curl: args.curl, force: true})
                    }
                })
            }
        }

        NeedContext.show({
            items: items, e: args.e, after_hide: () => {
                Curlist.focus()
            }
        })
    }

    remove_curl (curl) {
        let cleaned = []

        for (let item of this.list) {
            if (item.curl !== curl) {
                cleaned.push(item)
            }
        }

        this.list = cleaned
    }

    remove (removed) {
        for (let curl of removed) {
            let item = this.get(curl)
            let el = item.element

            if (el) {
                el.remove()
            }

            let index = this.list.indexOf(item)
            this.list.splice(index, 1)
        }

        Container.check_empty()
    }
}

const Items = new ItemsClass()