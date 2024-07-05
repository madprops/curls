/*

This shows an intro on the first visit

*/

class IntroClass {
    constructor() {
        this.ls_name = `intro_shown`
    }

    setup() {
        let shown = this.load_intro()

        if (!shown) {
            this.show()
            this.save()
        }
    }

    save() {
        Utils.save(this.ls_name, true)
    }

    load_intro() {
        return Utils.load_boolean(this.ls_name, false)
    }

    show() {
        Windows.alert({title: `Curls ${App.version}`, message: App.intro})
    }
}

const Intro = new IntroClass()