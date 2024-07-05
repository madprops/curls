App.setup_intro = () => {
    let shown = App.load_intro()

    if (!shown) {
        App.show_intro()
        App.save_intro_shown()
    }
}

App.save_intro_shown = () => {
    Utils.save(`intro_shown`, true)
}

App.load_intro = () => {
    return Utils.load_boolean(`intro_shown`, false)
}

App.show_intro = () => {
    Windows.alert({title: `Curls ${App.version}`, message: App.intro})
}