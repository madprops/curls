class Menu {
    static setup() {
        let menu = DOM.el(`#menu`)

        DOM.ev(menu, `click`, (e) => {
            this.show(e)
        })
    }

    static show(e) {
        let curls = Curls.get()
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
                        Curls.add(`top`)
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
                        Curls.add(`top`)
                    }
                },
                ...data,
            ]
        }

        NeedContext.show({items: items, e: e})
    }

    static export() {
        let curlists = {}

        for (let color in Colors.colors) {
            let curlist = Curls.get(color)

            if (!curlist.length) {
                continue
            }

            curlists[color] = curlist
        }

        if (!Object.keys(curlists).length) {
            Windows.alert({message: `No curls to export`})
            return
        }

        Windows.alert_export(curlists)
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
            let curlists = JSON.parse(data)
            let modified = false

            for (let color in curlists) {
                let curlist = curlists[color]

                if (!curlist) {
                    continue
                }

                Curls.save(curlist, color)
                modified = true
            }

            if (!modified) {
                Windows.alert({message: `No curls to import`})
                return
            }

            this.update()
            Update.update()
        }
        catch (err) {
            Utils.error(err)
            Windows.alert({title: `Error`, message: err})
        }
    }
}