/*

This shows or hides the controls

*/

const Controls = {
    enabled: true,
}

Controls.setup = () => {
    Controls.enabled = Controls.load_enabled()
    Controls.check_enabled()
}

Controls.save_enabled = () => {
    Utils.save(`controls_enabled`, Controls.enabled)
}

Controls.load_enabled = () => {
    return Utils.load_boolean(`controls_enabled`)
}

Controls.check_enabled = () => {
    if (Controls.enabled) {
        DOM.show(`#controls`)
        Curlist.check_enabled()
    }
    else {
        DOM.hide(`#controls`)
        DOM.hide(`#left_side`)
    }
}