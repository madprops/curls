/*

This changes the status of a curl

*/

class Change {
    static debouncer_delay = 250
    static changing = false
    static clear_delay = 800
    static status_max_length = 500
    static key_length = 22

    static setup() {
        let curl = DOM.el(`#change_curl`)
        let submit = DOM.el(`#change_submit`)

        DOM.ev(submit, `click`, () => {
            this.change()
        })

        this.debouncer = Utils.create_debouncer((force, feedback) => {
            this.do_change(force, feedback)
        }, this.debouncer_delay)

        DOM.ev(curl, `focus`, (e) => {
            let value = curl.value
            console.log(value)

            if (value) {
                Select.curl(value)
            }
        })

        DOM.ev(curl, `blur`, (e) => {
            Select.deselect_all()
        })
    }

    static change() {
        this.debouncer.call()
    }

    static do_change() {
        this.debouncer.cancel()
        Utils.info(`Change: Trigger`)

        if (this.changing) {
            Utils.error(`Slow down`)
            return
        }

        let curl = DOM.el(`#change_curl`).value.toLowerCase()
        let key = DOM.el(`#change_key`).value
        let status = DOM.el(`#change_status`).value.trim()

        if (!curl || !key || !status) {
            return
        }

        if (curl.length > Curls.max_length) {
            Utils.error(App.curl_too_long)
            Windows.alert({title: `Error`, message: App.curl_too_long})
            return
        }

        if (key.length > this.key_length) {
            Utils.error(App.key_too_long)
            Windows.alert({title: `Error`, message: App.key_too_long})
            return
        }

        if (status.length > this.status_max_length) {
            Utils.error(App.status_too_long)
            Windows.alert({title: `Error`, message: App.status_too_long})
            return
        }

        let url = `/change`
        let params = new URLSearchParams()

        params.append(`curl`, curl)
        params.append(`key`, key)
        params.append(`status`, status)

        this.show_changing()
        Status.save(status)
        this.changing = true
        Utils.info(`Change: Request ${App.network}`)

        fetch(url, {
            method: `POST`,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`
            },
            body: params,
        })
            .then(response => response.text())
            .then(ans => {
                Utils.info(`Response: ${ans}`)
                this.clear_changing()

                if (ans === `ok`) {
                    this.clear_status()
                    Update.update({feedback: false})
                    Curls.add_owned(curl)
                    Picker.add()
                }
                else {
                    Windows.alert({message: ans})
                }
            })
            .catch(e => {
                Utils.error(`Failed to change`)
                this.clear_changing()
            })
    }

    static clear_status() {
        DOM.el(`#change_status`).value = ``
    }

    static show_changing() {
        let button = DOM.el(`#change_submit`)
        clearTimeout(this.clear_changing_timeout)
        button.classList.add(`active`)
    }

    static clear_changing() {
        this.changing = false

        this.clear_changing_timeout = setTimeout(() => {
            let button = DOM.el(`#change_submit`)
            button.classList.remove(`active`)
        }, this.clear_delay)
    }
}