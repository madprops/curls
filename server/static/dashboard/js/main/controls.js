/*

This shows or hides the controls

*/

const Controls = {
    enabled: true,
    ls_name: `controls_enabled`,
}

Controls.setup = () => {
    Controls.enabled = Controls.load_enabled()
    Controls.check_enabled()
}

Controls.save_enabled = () => {
    Utils.save(Controls.ls_name, Controls.enabled)
}

Controls.load_enabled = () => {
    return Utils.load_boolean(Controls.ls_name)
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