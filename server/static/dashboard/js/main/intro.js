/*

This shows an intro on the first visit

*/

const Intro = {
    ls_name: `intro_shown`,
}

Intro.setup = () => {
    let shown = Intro.load_intro()

    if (!shown) {
        Intro.show()
        Intro.save()
    }
}

Intro.save = () => {
    Utils.save(Intro.ls_name, true)
}

Intro.load_intro = () => {
    return Utils.load_boolean(Intro.ls_name, false)
}

Intro.show = () => {
    Windows.alert({title: `Curls ${App.version}`, message: App.intro})
}