App.show_message = (title, message) => {
    App.info_window.show([title, message])
}

App.show_app_info = () => {
    App.show_message(`Curls ${App.version}`, App.app_info)
}

App.setup_windows = () => {
    App.info_window = Msg.factory({
        class: "green",
        enable_titlebar: true,
        center_titlebar: true,
    })

    App.prompt_window = Msg.factory({
        class: "blue",
        enable_titlebar: true,
        center_titlebar: true,
    })

    let template = DOM.el(`#prompt_template`)
    let html = template.innerHTML
    App.prompt_window.set(html)
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
}

App.prompt_submit = () => {
    if (!App.prompt_callback) {
        return
    }

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