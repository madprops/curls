/*

This manages the dates shown in the container

*/

class Dates {
    static ls_mode = `date_mode`
    static ls_enabled = `date_enabled`
    static default_mode = `12`

    static setup() {
        this.mode = this.load_mode()
        this.enabled = this.load_enabled()
    }

    static change_mode() {
        let selected = window.getSelection().toString()

        if (selected) {
            return
        }

        this.mode = this.mode === `12` ? `24` : `12`
        Utils.save(this.ls_mode, this.mode)
        this.fill_items()
        Container.update()
    }

    static load_mode() {
        return Utils.load_string(this.ls_mode, this.default_mode)
    }

    static fill_items() {
        for (let item of Items.list) {
            let date = new Date(item.updated + `Z`)
            let s_date

            if (this.mode === `12`) {
                s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
            }
            else if (this.mode === `24`) {
                s_date = dateFormat(date, `dd/mmm/yy - HH:MM`)
            }

            item.updated_text = s_date
        }
    }

    static save_enabled() {
        Utils.save(this.ls_enabled, this.enabled)
    }

    static load_enabled() {
        return Utils.load_boolean(this.ls_enabled)
    }
}