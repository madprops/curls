class Menu {
    static setup() {
        let menu = DOM.el(`#menu`)

        DOM.ev(menu, `click`, (e) => {
            this.show(e)
        })
    }

    static show(e) {
        let curls = Curls.get_curls()
        let items

        let data = [
            {
                separator: true,
            },
            {
                text: `Export`,
                action: (e) => {
                    this.export_menu(e)
                }
            },
            {
                text: `Import`,
                action: () => {
                    this.import()
                }
            },
            {
                text: `Clear`,
                action: () => {
                    Curls.clear_all()
                }
            },
        ]

        if (curls.length) {
            items = [
                {
                    text: `Add`,
                    action: () => {
                        Curls.add()
                    }
                },
                {
                    text: `Copy`,
                    action: () => {
                        Curls.copy()
                    }
                },
                {
                    text: `Replace`,
                    action: () => {
                        Curls.replace()
                    }
                },
                {
                    text: `Remove`,
                    action: (e) => {
                        Curls.show_remove_menu(e)
                    }
                },
                ...data,
            ]
        }
        else {
            items = [
                {
                    text: `Add`,
                    action: () => {
                        Curls.add()
                    }
                },
                ...data,
            ]
        }

        items.push({
            separator: true,
        })

        items.push({
            text: `Claim`,
            action: () => {
                this.claim()
            }
        })

        Utils.context({items: items, e: e})
    }

    static export_menu(e) {
        let items = [
            {
                text: `Full`,
                action: () => {
                    this.export(true)
                }
            },
            {
                text: `Curls`,
                action: () => {
                    this.export(false)
                }
            },
        ]

        Utils.context({items: items, e: e})
    }

    static export(full = true) {
        let colors = {}

        for (let color in Colors.colors) {
            let items = Curls.get(color)

            if (!items.length) {
                continue
            }

            let new_items

            if (full) {
                new_items = items
            }
            else {
                new_items = []

                for (let item of items) {
                    new_items.push({curl: item.curl})
                }
            }

            colors[color] = new_items
        }

        if (!Object.keys(colors).length) {
            Windows.alert({message: `No curls to export`})
            return
        }

        Windows.alert_export(colors)
    }

    static import() {
        Windows.prompt({title: `Paste Data`, callback: (value) => {
            this.import_submit(value)
        }, message: `You get this data in Export`})
    }

    static import_submit(data) {
        if (!data) {
            return
        }

        try {
            let colors = JSON.parse(data)
            let modified = false

            for (let color in colors) {
                let items = colors[color]

                if (!items.length) {
                    continue
                }

                Curls.save(items, color)
                modified = true
            }

            if (!modified) {
                Windows.alert({message: `No curls to import`})
                return
            }

            Update.update()
        }
        catch (err) {
            Utils.error(err)
            Windows.alert({title: `Error`, message: err})
        }
    }

    static claim() {
        window.open(`/claim`, `_blank`)
    }
}