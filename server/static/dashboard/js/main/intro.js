App.setup_intro = () => {
    let shown = App.load_intro()

    if (!shown) {
        App.show_intro()
        App.save_intro_shown()
    }
}

App.save_intro_shown = () => {
    localStorage.setItem(`intro_shown`, true)
}

App.load_intro = () => {
    let saved = localStorage.getItem(`intro_shown`) || `false`
    return saved === `true`
}

App.show_intro = () => {
    App.alert(App.intro, `Curls ${App.version}`)
}