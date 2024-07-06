/*

This shows or hides the controls

*/

class Controls {
    static enabled = true
    static ls_name = `controls_enabled`

    static setup() {
        this.enabled = this.load_enabled()
        this.check_enabled()
    }

    static save_enabled() {
        Utils.save(this.ls_name, this.enabled)
    }

    static load_enabled() {
        return Utils.load_boolean(this.ls_name)
    }

    static check_enabled() {
        if (this.enabled) {
            DOM.show(`#controls`)
        }
        else {
            DOM.hide(`#controls`)
        }
    }
}