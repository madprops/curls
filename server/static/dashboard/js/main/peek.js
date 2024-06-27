App.show_peek = (curl) => {
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

    peek.classList.add(`active`)
    App.peek_enabled = true
    App.peek_curl = curl
}

App.hide_peek = () => {
    DOM.el(`#peek`).classList.remove(`active`)
    App.peek_enabled = false
    App.peek_curl = ``
}

App.toggle_peek = (curl) => {
    if (curl === App.peek_curl) {
        if (App.peek_enabled) {
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