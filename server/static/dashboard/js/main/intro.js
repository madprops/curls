App.setup_intro = () => {
    let shown = App.load_intro()

    if (!shown) {
        App.show_intro()
        App.save_intro_shown()
    }
}

App.save_intro_shown = () => {
    App.save(`intro_shown`, true)
}

App.load_intro = () => {
    return App.load_boolean(`intro_shown`)
}

App.show_intro = () => {
    App.alert({title: `Curls ${App.version}`, message: App.intro})
}