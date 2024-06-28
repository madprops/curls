App.setup_peek = () => {
    let checkbox = DOM.el(`#peek_enabled`)
    App.peek_enabled = App.load_peek_enabled()
    checkbox.checked = App.peek_enabled
    let checkbox_item = DOM.el(`#peek_enabled_item`)

    DOM.ev(checkbox_item, `click`, () => {
        App.peek_enabled = !App.peek_enabled
        checkbox.checked = App.peek_enabled
        App.save_peek_enabled()
    })
}

App.save_peek_enabled = () => {
    localStorage.setItem(`peek_enabled`, App.peek_enabled)
}

App.load_peek_enabled = () => {
    let saved = localStorage.getItem(`peek_enabled`) || `true`
    return saved === `true`
}

App.show_peek = (curl) => {
    if (!App.peek_enabled) {
        return
    }

    let peek = DOM.el(`#peek`)
    let item = App.get_item(curl)
    let icon = DOM.create(`div`, `peek_icon`)
    let canvas = DOM.create(`canvas`, `peek_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    icon.append(canvas)
    let curl_ = DOM.create(`div`, `peek_curl`)
    curl_.textContent = item.curl
    let status = DOM.create(`div`, `peek_status`)
    status.innerHTML = App.sanitize(item.status)
    let updated = DOM.create(`div`, `peek_updated`)
    updated.textContent = item.updated_text

    DOM.ev(icon, `click`, () => {
        App.do_copy_item(item.curl, item.status, item.updated_text, icon)
    })

    icon.title = `Click to copy`

    let close = DOM.create(`div`, `peek_close glow_white`)
    close.textContent = `Close`

    DOM.ev(close, `click`, () => {
        App.hide_peek()
    })

    peek.innerHTML = ``
    peek.append(icon)
    peek.append(curl_)
    peek.append(status)
    peek.append(close)
    peek.append(updated)

    peek.classList.add(`active`)
    App.peek_open = true
    App.peek_curl = curl
}

App.hide_peek = () => {
    if (!App.peek_open) {
        return
    }

    DOM.el(`#peek`).classList.remove(`active`)
    App.peek_open = false
    App.peek_curl = ``
}

App.toggle_peek = (curl) => {
    if (curl === App.peek_curl) {
        if (App.peek_open) {
            App.hide_peek()
        }
        else {
            App.show_peek(curl)
        }
    }
    else {
        App.show_peek(curl)
    }
}