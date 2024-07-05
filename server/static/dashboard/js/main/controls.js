/*

This shows or hides the controls

*/

class ControlsClass {
    constructor() {
        this.enabled = true
        this.ls_name = `controls_enabled`
    }

    setup() {
        this.enabled = this.load_enabled()
        this.check_enabled()
    }

    save_enabled() {
        Utils.save(this.ls_name, this.enabled)
    }

    load_enabled() {
        return Utils.load_boolean(this.ls_name)
    }

    check_enabled() {
        if (this.enabled) {
            DOM.show(`#controls`)
            Curlist.check_enabled()
        }
        else {
            DOM.hide(`#controls`)
            DOM.hide(`#left_side`)
        }
    }
}

const Controls = new ControlsClass()