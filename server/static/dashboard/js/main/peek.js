App.setup_peek = () => {
    App.peek_enabled = App.load_peek_enabled()

    App.peek_debouncer = App.create_debouncer((args) => {
        App.do_show_peek(args)
    }, App.peek_debouncer_delay)
}

App.save_peek_enabled = () => {
    App.save(`peek_enabled`, App.peek_enabled)
}

App.load_peek_enabled = () => {
    return App.load_boolean(`peek_enabled`)
}

App.show_peek = (args) => {
    App.peek_debouncer.call(args)
}

App.do_show_peek = (args = {}) => {
    App.peek_debouncer.cancel()

    let def_args = {
        force: false,
    }

    App.def_args(def_args, args)

    if (!App.peek_enabled && !args.force) {
        return
    }

    if (App.peek_open && (App.peek_curl === args.curl)) {
        return
    }

    let peek = DOM.el(`#peek`)
    let item = App.get_item(args.curl)
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

    DOM.ev(icon, `click`, (e) => {
        App.show_item_menu({curl: args.curl, e: e, from: `peek`})
    })

    icon.title = `Click to show menu`

    let close = DOM.create(`div`, `peek_close glow_white noselect`)
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
    App.peek_curl = args.curl
}

App.hide_peek = () => {
    if (!App.peek_open) {
        return
    }

    DOM.el(`#peek`).classList.remove(`active`)
    App.peek_open = false
    App.peek_curl = ``
}