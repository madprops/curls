App.alert = (message,  title = `Information`) => {
    App.alert_window.set_title(title)
    let text = DOM.el(`#alert_text`)
    text.textContent = message
    App.alert_window.show()
}

App.setup_windows = () => {
    let alert_template = DOM.el(`#alert_template`)
    let alert_html = alert_template.innerHTML

    App.alert_window = Msg.factory({
        class: "green",
        enable_titlebar: true,
        center_titlebar: true,
    })

    App.alert_window.set(alert_html)

    App.prompt_window = Msg.factory({
        class: "blue",
        enable_titlebar: true,
        center_titlebar: true,
    })

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
    App.prompt_window.set_title("Prompt")
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

    App.confirm_window = Msg.factory({
        class: "red",
        enable_titlebar: true,
        center_titlebar: true,
    })

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

App.alert_copy = () => {
    let text = DOM.el(`#alert_text`)
    App.copy_to_clipboard(text.textContent)
    App.alert_window.close()
}

App.confirm = (title, ok) => {
    App.confirm_ok = ok
    App.confirm_window.set_title(title)
    App.confirm_window.show()
    DOM.el(`#confirm_ok`).focus()
}

App.prompt_submit = () => {
    let value = DOM.el(`#prompt_input`).value.trim()
    App.prompt_callback(value)
    App.prompt_window.close()
}

App.prompt = (title, callback, value = ``) => {
    App.prompt_callback = callback

    let input = DOM.el(`#prompt_input`)
    input.value = value

    App.prompt_window.set_title(title)
    App.prompt_window.show()

    input.focus()
}