/*

This creates and shows modal windows

*/

const Windows = {
    max_items: 1000,
}

Windows.create = (color) => {
    let common = {
        enable_titlebar: true,
        center_titlebar: true,
        window_x: `none`,
    }

    return Msg.factory(Object.assign({}, common, {
        class: color,
    }))
}

Windows.setup = () => {
    let alert_template = DOM.el(`#alert_template`)
    let alert_html = alert_template.innerHTML
    Windows.alert_window = Windows.create(`green`)
    Windows.alert_window.set(alert_html)
    Windows.prompt_window = Windows.create(`blue`)
    let copy = DOM.el(`#alert_copy`)

    DOM.ev(copy, `click`, () => {
        Windows.alert_copy()
    })

    let alert_ok = DOM.el(`#alert_ok`)

    DOM.ev(alert_ok, `click`, (e) => {
        Windows.alert_window.close()
    })

    let prompt_template = DOM.el(`#prompt_template`)
    let prompt_html = prompt_template.innerHTML
    Windows.prompt_window.set(prompt_html)
    Windows.prompt_window.set_title(`Prompt`)
    let submit = DOM.el(`#prompt_submit`)
    let input = DOM.el(`#prompt_input`)

    DOM.ev(submit, `click`, () => {
        Windows.prompt_submit()
    })

    DOM.ev(input, `keydown`, (e) => {
        if (e.key === `Enter`) {
            Windows.prompt_submit()
        }
    })

    Windows.confirm_window = Windows.create(`red`)
    let confirm_template = DOM.el(`#confirm_template`)
    let confirm_html = confirm_template.innerHTML
    Windows.confirm_window.set(confirm_html)

    let ok = DOM.el(`#confirm_ok`)

    DOM.ev(ok, `click`, () => {
        Windows.confirm_ok()
        Windows.confirm_window.close()
    })

    DOM.ev(ok, `keydown`, (e) => {
        if (e.key === `Enter`) {
            Windows.confirm_ok()
            Windows.confirm_window.close()
        }
    })
}

Windows.alert = (args = {}) => {
    let def_args = {
        title: `Information`,
        message: ``,
        copy: false,
        ok: true,
    }

    Utils.def_args(def_args, args)
    Windows.alert_window.set_title(args.title)
    let msg = DOM.el(`#alert_message`)

    if (args.message) {
        DOM.show(msg)
        msg.textContent = args.message
    }
    else {
        DOM.hide(msg)
    }

    let copy = DOM.el(`#alert_copy`)

    if (args.copy) {
        DOM.show(copy)
    }
    else {
        DOM.hide(copy)
    }

    let ok = DOM.el(`#alert_ok`)

    if (args.ok) {
        DOM.show(ok)
    }
    else {
        DOM.hide(ok)
    }

    Windows.alert_window.show()
}

Windows.alert_copy = () => {
    let text = DOM.el(`#alert_message`)
    Utils.copy_to_clipboard(text.textContent)
    Windows.alert_window.close()
}

Windows.confirm = (args = {}) => {
    let def_args = {
        message: ``,
    }

    Utils.def_args(def_args, args)
    Windows.confirm_ok = args.ok
    Windows.confirm_window.set_title(args.title)
    Windows.confirm_window.show()
    DOM.el(`#confirm_ok`).focus()
    let msg = DOM.el(`#confirm_message`)

    if (args.message) {
        msg.textContent = args.message
        DOM.show(msg)
    }
    else {
        DOM.hide(msg)
    }
}

Windows.prompt_submit = () => {
    let value = DOM.el(`#prompt_input`).value.trim()
    Windows.prompt_callback(value)
    Windows.prompt_window.close()
}

Windows.prompt = (args = {}) => {
    let def_args = {
        value: ``,
        message: ``,
    }

    Utils.def_args(def_args, args)
    Windows.prompt_callback = args.callback
    let input = DOM.el(`#prompt_input`)
    input.value = args.value
    Windows.prompt_window.set_title(args.title)
    let msg = DOM.el(`#prompt_message`)

    if (args.message) {
        msg.textContent = args.message
        DOM.show(msg)
    }
    else {
        DOM.hide(msg)
    }

    Windows.prompt_window.show()
    input.focus()
}

Windows.alert_export = (data) => {
    let data_str = Utils.sanitize(JSON.stringify(data))
    Windows.alert({title: `Copy the data below`, message: data_str, copy: true, ok: false})
}