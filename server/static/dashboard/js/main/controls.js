App.setup_controls = () => {
    let checkbox = DOM.el(`#controls_enabled`)
    let controls_top = DOM.el(`#controls_top`)
    let controls_bottom = DOM.el(`#controls_bottom`)
    let checkbox_item = DOM.el(`#controls_enabled_item`)

    App.controls_enabled = App.load_controls_enabled()
    checkbox.checked = App.controls_enabled

    DOM.ev(checkbox_item, `click`, () => {
        App.controls_enabled = !App.controls_enabled
        checkbox.checked = App.controls_enabled
        App.save_controls_enabled()
        App.check_controls()
    })

    DOM.ev(controls_top, `dblclick`, (e) => {
        if (e.target === controls_top) {
            App.add_curls()
        }
    })

    DOM.ev(controls_bottom, `dblclick`, (e) => {
        if (e.target === controls_bottom) {
            App.add_curls()
        }
    })

    App.check_controls()
}

App.save_controls_enabled = () => {
    localStorage.setItem(`controls_enabled`, App.controls_enabled)
}

App.load_controls_enabled = () => {
    let saved = localStorage.getItem(`controls_enabled`) || `true`
    return saved === `true`
}

App.check_controls = () => {
    if (App.controls_enabled) {
        DOM.show(`#controls`)
        App.check_curlist_enabled()
    }
    else {
        DOM.hide(`#controls`)
        DOM.hide(`#left_side`)
    }
}