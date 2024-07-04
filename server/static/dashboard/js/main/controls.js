App.setup_controls = () => {
    App.controls_enabled = App.load_controls_enabled()
    App.check_controls()
}

App.save_controls_enabled = () => {
    App.save(`controls_enabled`, App.controls_enabled)
}

App.load_controls_enabled = () => {
    return App.load_boolean(`controls_enabled`)
}

App.check_controls = () => {
    if (App.controls_enabled) {
        DOM.show(`#controls`)
        Curlist.check_enabled()
    }
    else {
        DOM.hide(`#controls`)
        DOM.hide(`#left_side`)
    }
}