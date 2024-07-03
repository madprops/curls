App.create_window = (color) => {
    let common = {
        enable_titlebar: true,
        center_titlebar: true,
        window_x: `none`,
    }

    return Msg.factory(Object.assign({}, common, {
        class: color,
    }))
}

App.setup_windows = () => {
    let alert_template = DOM.el(`#alert_template`)
    let alert_html = alert_template.innerHTML
    App.alert_window = App.create_window(`green`)
    App.alert_window.set(alert_html)
    App.prompt_window = App.create_window(`blue`)
    let copy = DOM.el(`#alert_copy`)

    DOM.ev(copy, `click`, () => {
        App.alert_copy()
    })

    let alert_ok = DOM.el(`#alert_ok`)

    DOM.ev(alert_ok, `click`, (e) => {
        App.alert_window.close()
    })

    let prompt_template = DOM.el(`#prompt_template`)
    let prompt_html = prompt_template.innerHTML
    App.prompt_window.set(prompt_html)
    App.prompt_window.set_title(`Prompt`)
    let submit = DOM.el(`#prompt_submit`)
    let input = DOM.el(`#prompt_input`)

    DOM.ev(submit, `click`, () => {
        App.prompt_submit()
    })

    DOM.ev(input, `keydown`, (e) => {
        if (e.key === `Enter`) {
            App.prompt_submit()
        }
    })

    App.confirm_window = App.create_window(`red`)
    let confirm_template = DOM.el(`#confirm_template`)
    let confirm_html = confirm_template.innerHTML
    App.confirm_window.set(confirm_html)

    let ok = DOM.el(`#confirm_ok`)

    DOM.ev(ok, `click`, () => {
        App.confirm_ok()
        App.confirm_window.close()
    })

    DOM.ev(ok, `keydown`, (e) => {
        if (e.key === `Enter`) {
            App.confirm_ok()
            App.confirm_window.close()
        }
    })
}

App.alert = (message, title = `Information`) => {
    App.alert_window.set_title(title)
    let msg = DOM.el(`#alert_message`)
    msg.textContent = message
    App.alert_window.show()
}

App.alert_copy = () => {
    let text = DOM.el(`#alert_message`)
    App.copy_to_clipboard(text.textContent)
    App.alert_window.close()
}

App.confirm = (args = {}) => {
    let def_args = {
        message: ``,
    }

    App.def_args(def_args, args)
    App.confirm_ok = args.ok
    App.confirm_window.set_title(args.title)
    App.confirm_window.show()
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

App.prompt_submit = () => {
    let value = DOM.el(`#prompt_input`).value.trim()
    App.prompt_callback(value)
    App.prompt_window.close()
}

App.prompt = (args = {}) => {
    let def_args = {
        value: ``,
        message: ``,
    }

    App.def_args(def_args, args)
    App.prompt_callback = args.callback
    let input = DOM.el(`#prompt_input`)
    input.value = args.value
    App.prompt_window.set_title(args.title)
    let msg = DOM.el(`#prompt_message`)

    if (args.message) {
        msg.textContent = args.message
        DOM.show(msg)
    }
    else {
        DOM.hide(msg)
    }

    App.prompt_window.show()
    input.focus()
}