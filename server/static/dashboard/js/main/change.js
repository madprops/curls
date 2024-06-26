App.setup_change = () => {
    let submit = DOM.el(`#change_submit`)

    DOM.ev(submit, `click`, () => {
        App.change()
    })

    App.change_debouncer = App.create_debouncer((force, feedback) => {
        App.do_change(force, feedback)
    }, App.change_debouncer_delay)
}

App.change = () => {
    App.change_debouncer.call()
}

App.do_change = () => {
    App.info(`Change: Trigger`)

    if (App.changing) {
        App.error(`Slow down`)
        return
    }

    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let status = DOM.el(`#change_status`).value.trim()

    if (!curl || !key || !status) {
        return
    }

    if (curl.length > App.curl_max_length) {
        App.error(App.curl_too_long)
        alert(App.curl_too_long)
        return
    }

    if (key.length > App.key_length) {
        App.error(App.key_too_long)
        alert(App.key_too_long)
        return
    }

    if (status.length > App.status_max_length) {
        App.error(App.status_too_long)
        alert(App.status_too_long)
        return
    }

    let url = `/change`
    let params = new URLSearchParams()

    params.append(`curl`, curl)
    params.append(`key`, key)
    params.append(`status`, status)

    App.show_changing()
    App.save_status(status)
    App.changing = true
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
            App.clear_changing()

            if (ans === `ok`) {
                App.clear_status()
                App.update(true, false)
                App.add_owned_curl(curl)
                App.add_to_picker()
            }
            else {
                alert(ans)
            }
        })
        .catch(e => {
            App.error(`Failed to change`)
            App.clear_changing()
        })
}

App.clear_status = () => {
    DOM.el(`#change_status`).value = ``
}

App.show_changing = () => {
    let button = DOM.el(`#change_submit`)
    clearTimeout(App.clear_changing_timeout)
    button.classList.add(`active`)
}

App.clear_changing = () => {
    App.changing = false

    App.clear_changing_timeout = setTimeout(() => {
        let button = DOM.el(`#change_submit`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}