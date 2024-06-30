App.setup_controls = () => {
    let checkbox = DOM.el(`#controls_enabled`)
    App.controls_enabled = App.load_controls_enabled()
    checkbox.checked = App.controls_enabled
    let checkbox_item = DOM.el(`#controls_enabled_item`)

    DOM.ev(checkbox_item, `click`, () => {
        App.controls_enabled = !App.controls_enabled
        checkbox.checked = App.controls_enabled
        App.save_controls_enabled()
        App.check_controls()
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
    }
    else {
        DOM.hide(`#controls`)
    }
}