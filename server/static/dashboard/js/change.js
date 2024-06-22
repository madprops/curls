App.setup_change = () => {
    let status = DOM.el(`#change_status`)

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `Enter`) {
            App.change()
        }
    })

    let submit = DOM.el(`#change_submit`)

    DOM.ev(submit, `click`, () => {
        App.change()
    })
}

App.change = () => {
    App.info(`Changing...`)
    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let status = DOM.el(`#change_status`).value

    if (!curl || !key || !status) {
        return
    }

    if (curl.length > App.curl_max_length) {
        App.info(App.curl_too_long)
        alert(App.curl_too_long)
        return
    }

    if (key.length > App.key_length) {
        App.info(App.key_too_long)
        alert(App.key_too_long)
        return
    }

    if (status.length > App.status_max_length) {
        App.info(App.status_too_long)
        alert(App.status_too_long)
        return
    }

    let url = `/change`
    let params = new URLSearchParams()

    params.append(`curl`, curl)
    params.append(`key`, key)
    params.append(`status`, status)

    App.show_changing()

    fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/x-www-form-urlencoded`
        },
        body: params,
    })
    .then(response => response.text())
    .then(ans => {
        App.info(ans)
        App.clear_changing()

        if (ans === `ok`) {
            App.clear_status()
            App.update(true, false)
            App.add_owned_curl(curl)
            App.add_to_picker()
        }
        else {
            App.info(ans)
            alert(ans)
        }
    })
    .catch(e => {
        App.info(`Error: Failed to change`)
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
    App.clear_changing_timeout = setTimeout(() => {
        let button = DOM.el(`#change_submit`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}