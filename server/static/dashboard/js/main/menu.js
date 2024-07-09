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
                action: () => {
                    this.export()
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

    static export() {
        let colors = {}

        for (let color in Colors.colors) {
            let curls = Curls.get_curls(color)

            if (!curls.length) {
                continue
            }

            colors[color] = curls
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
                let curls = colors[color]

                if (!curls) {
                    continue
                }

                Curls.save(curls, color)
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