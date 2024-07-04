/*

This changes the status of a curl

*/

const Change = {
    debouncer_delay: 250,
    changing: false,
    clear_delay: 800,
}

Change.setup = () => {
    let submit = DOM.el(`#change_submit`)

    DOM.ev(submit, `click`, () => {
        Change.trigger()
    })

    Change.debouncer = App.create_debouncer((force, feedback) => {
        Change.do_change(force, feedback)
    }, Change.debouncer_delay)
}

Change.trigger = () => {
    Change.debouncer.call()
}

Change.do_change = () => {
    Change.debouncer.cancel()
    App.info(`Change: Trigger`)

    if (Change.changing) {
        App.error(`Slow down`)
        return
    }

    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let status = DOM.el(`#change_status`).value.trim()

    if (!curl || !key || !status) {
        return
    }

    if (curl.length > Curls.max_length) {
        App.error(App.curl_too_long)
        App.alert({title: `Error`, message: App.curl_too_long})
        return
    }

    if (key.length > App.key_length) {
        App.error(App.key_too_long)
        App.alert({title: `Error`, message: App.key_too_long})
        return
    }

    if (status.length > App.status_max_length) {
        App.error(App.status_too_long)
        App.alert({title: `Error`, message: App.status_too_long})
        return
    }

    let url = `/change`
    let params = new URLSearchParams()

    params.append(`curl`, curl)
    params.append(`key`, key)
    params.append(`status`, status)

    Change.show_changing()
    App.save_status(status)
    Change.changing = true
    App.info(`Change: Request ${App.network}`)

    fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/x-www-form-urlencoded`
        },
        body: params,
    })
        .then(response => response.text())
        .then(ans => {
            App.info(`Response: ${ans}`)
            Change.clear_changing()

            if (ans === `ok`) {
                Change.clear_status()
                Update.now({feedback: false})
                Curls.add_owned(curl)
                Picker.add()
            }
            else {
                App.alert({message: ans})
            }
        })
        .catch(e => {
            App.error(`Failed to change`)
            Change.clear_changing()
        })
}

Change.clear_status = () => {
    DOM.el(`#change_status`).value = ``
}

Change.show_changing = () => {
    let button = DOM.el(`#change_submit`)
    clearTimeout(Change.clear_changing_timeout)
    button.classList.add(`active`)
}

Change.clear_changing = () => {
    Change.changing = false

    Change.clear_changing_timeout = setTimeout(() => {
        let button = DOM.el(`#change_submit`)
        button.classList.remove(`active`)
    }, Change.clear_delay)
}