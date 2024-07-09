/*

This shows an intro on the first visit

*/

class Intro {
    static ls_name = `intro_shown`

    static setup() {
        this.intro = [
            `Curls are pointers to text that you control.`,
            `You can claim your own curl and receive a key.`,
            `With this key you can change the status of the curl.`,
            `The key can't be recovered and should be saved securely.`,
            `In this Dashboard you can monitor the curls you want.`,
            `Each color has its own set of curls.`,
            `You are limited to 100 curls per color.`,
        ].join(`\n`)

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
        Windows.alert({title: `Curls ${App.version}`, message: this.intro})
    }
}