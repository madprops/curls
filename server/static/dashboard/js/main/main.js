App.setup = () => {
    NeedContext.init()
    App.setup_buttons()
    App.setup_color()
    App.setup_curlist()
    App.setup_container()
    App.setup_updater()
    App.setup_sort()
    App.setup_change()
    App.setup_picker()
    App.setup_status()
    App.setup_filter()
    App.setup_peek()
    App.start_keyboard()
    App.setup_font()
    App.update(true)
}

App.setup_buttons = () => {
    let toggle_curlist = DOM.el(`#toggle_curlist`)

    DOM.ev(toggle_curlist, `click`, () => {
        App.toggle_curlist()
    })

    let claim = DOM.el(`#claim`)

    DOM.ev(claim, `click`, () => {
        App.claim()
    })

    let top = DOM.el(`#scroller_top`)

    DOM.ev(top, `click`, () => {
        App.scroll_container_top()
    })

    let bottom = DOM.el(`#scroller_bottom`)

    DOM.ev(bottom, `click`, () => {
        App.scroll_container_bottom()
    })
}

App.update_title = () => {
    let color = App.capitalize(App.color_mode)
    document.title = `Curls - ${color}`
}

App.claim = () => {
    window.open(`/claim`, `_blank`)
}

App.start_keyboard = () => {
    DOM.ev(DOM.el(`#main`), `click`, (e) => {
        if (!e.target.closest(`#curlist`)) {
            App.unselect_curlist()

            if (!e.target.closest(`#peek`)) {
                App.hide_peek()
            }
        }
    })
}

App.setup_font = () => {
    let font = DOM.el(`#font`)

    DOM.ev(font, `change`, (e) => {
        localStorage.setItem(`font`, e.target.value)
        App.set_font()
    })

    font.value = App.load_font()
    App.set_font()
}

App.set_font = () => {
    let font = App.load_font()
    document.documentElement.style.setProperty(`--font`, font)
}

App.load_font = () => {
    return localStorage.getItem(`font`) || `sans-serif`
}