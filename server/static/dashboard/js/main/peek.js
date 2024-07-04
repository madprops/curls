/*

This is a popup that appears at the top right corner
This display a curl in full, and can be closed
It's closed automatically on focus changes

*/

const Peek = {
    enabled: true,
    open: false,
    curl: ``,
    debouncer_delay: 50,
    ls_name: `peek_enabled`,
}

Peek.setup = () => {
    Peek.enabled = Peek.load_enabled()

    Peek.debouncer = App.create_debouncer((args) => {
        Peek.do_show(args)
    }, Peek.debouncer_delay)
}

Peek.save_enabled = () => {
    App.save(Peek.ls_name, Peek.enabled)
}

Peek.load_enabled = () => {
    return App.load_boolean(Peek.ls_name)
}

Peek.show = (args) => {
    Peek.debouncer.call(args)
}

Peek.do_show = (args = {}) => {
    Peek.debouncer.cancel()

    let def_args = {
        force: false,
    }

    App.def_args(def_args, args)

    if (!Peek.enabled && !args.force) {
        return
    }

    if (Peek.open && (Peek.curl === args.curl)) {
        return
    }

    let peek = DOM.el(`#peek`)
    let item = Items.get(args.curl)

    if (!item) {
        return
    }

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
        Items.show_menu({curl: args.curl, e: e, from: `peek`})
    })

    icon.title = `Click to show menu`

    let close = DOM.create(`div`, `peek_close glow_white noselect`)
    close.textContent = `Close`

    DOM.ev(close, `click`, () => {
        Peek.hide()
    })

    peek.innerHTML = ``
    peek.append(icon)
    peek.append(curl_)
    peek.append(status)
    peek.append(close)
    peek.append(updated)

    peek.classList.add(`active`)
    Peek.open = true
    Peek.curl = args.curl
}

Peek.hide = () => {
    if (!Peek.open) {
        return
    }

    DOM.el(`#peek`).classList.remove(`active`)
    Peek.open = false
    Peek.curl = ``
}