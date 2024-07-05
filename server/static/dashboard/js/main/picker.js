/*

The picker stores owned curls

*/

class PickerClass {
    constructor () {
        this.max_items = 1000
        this.ls_name = `picker`
    }

    setup () {
        let picker = DOM.el(`#picker`)

        DOM.ev(picker, `click`, (e) => {
            this.show(e)
        })

        let items = this.get_items()

        if (items.length) {
            let first = items[0]
            DOM.el(`#change_curl`).value = first.curl
            DOM.el(`#change_key`).value = first.key
        }
    }

    get_items () {
        let saved = Utils.load_array(this.ls_name)
        return JSON.parse(saved)
    }

    add () {
        let curl = DOM.el(`#change_curl`).value.toLowerCase()
        let key = DOM.el(`#change_key`).value
        let cleaned = [{curl, key}]

        for (let item of this.get_items()) {
            if (item.curl === curl) {
                continue
            }

            cleaned.push(item)

            if (cleaned.length >= this.max_items) {
                break
            }
        }

        Utils.save(this.ls_name, JSON.stringify(cleaned))
    }

    show (e) {
        let items = []
        let picker_items = this.get_items()

        if (!picker_items.length) {
            items.push({
                text: `Import`,
                action: () => {
                    this.import()
                },
            })
        }
        else {
            for (let item of picker_items) {
                items.push({
                    text: item.curl,
                    action: () => {
                        DOM.el(`#change_curl`).value = item.curl
                        DOM.el(`#change_key`).value = item.key
                        this.add()
                    },
                    alt_action: () => {
                        this.remove_item(item.curl)
                    },
                })
            }

            if (items.length) {
                items.push({
                    separator: true,
                })
            }

            items.push({
                text: `Export`,
                action: () => {
                    this.export()
                },
            })

            items.push({
                text: `Import`,
                action: () => {
                    this.import()
                },
            })

            items.push({
                text: `Clear`,
                action: () => {
                    this.clear()
                },
            })
        }

        NeedContext.show({items: items, e: e})
    }

    export () {
        Windows.alert_export(this.get_items())
    }

    import () {
        Windows.prompt({title: `Paste Data`, callback: (value) => {
            this.import_submit(value)
        }, message: `You get this data in Export`})
    }

    import_submit (data) {
        if (!data) {
            return
        }

        try {
            let items = JSON.parse(data)
            Utils.save(this.ls_name, JSON.stringify(items))
        }
        catch (err) {
            Utils.error(err)
            Windows.alert({title: `Error`, message: err})
        }
    }

    clear () {
        Windows.confirm({title: `Clear Picker`, ok: () => {
            Utils.save(this.ls_name, `[]`)
        }, message: `Remove all items from the picker`})
    }

    remove_item (curl) {
        Windows.confirm({title: `Remove Picker Item`, ok: () => {
            this.do_remove_item(curl)
        }, message: curl})
    }

    do_remove_item (curl) {
        let cleaned = []

        for (let item of this.get_items()) {
            if (item.curl === curl) {
                continue
            }

            cleaned.push(item)
        }

        Utils.save(this.ls_name, JSON.stringify(cleaned))
    }
}

const Picker = new PickerClass()