/*

This shows an intro on the first visit

*/

class Intro {
    static ls_name = `intro_shown`

    static setup() {
        let shown = this.load_intro()

        if (!shown) {
            this.show()
            this.save()
        }
    }

    static save() {
        Utils.save(this.ls_name, true)
    }

    static load_intro() {
        return Utils.load_boolean(this.ls_name, false)
    }

    static show() {
        Windows.alert({title: `Curls ${App.version}`, message: App.intro})
    }
}