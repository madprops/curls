App.setup = () => {
    NeedContext.init()

    Block.setup()
    Colors.setup()
    Curlist.setup()
    Container.setup()
    Update.setup()
    Sort.setup()
    Change.setup()
    Picker.setup()
    Status.setup()
    Filter.setup()
    Peek.setup()
    More.setup()
    Font.setup()
    Border.setup()
    Controls.setup()
    Windows.setup()

    App.start_mouse()
    App.setup_resize()
    App.update_autocomplete()
    App.setup_buttons()
    App.setup_intro()

    Update.update()
}

App.setup_buttons = () => {
    let toggle_curlist = DOM.el(`#toggle_curlist`)

    DOM.ev(toggle_curlist, `click`, () => {
        Curlist.toggle()
    })

    let claim = DOM.el(`#claim`)

    DOM.ev(claim, `click`, () => {
        App.claim()
    })

    let top = DOM.el(`#scroller_top`)

    DOM.ev(top, `click`, () => {
        Container.scroll_top()
        Container.do_check_scroll()
    })

    let bottom = DOM.el(`#scroller_bottom`)

    DOM.ev(bottom, `click`, () => {
        Container.scroll_bottom()
        Container.do_check_scroll()
    })

    let version = DOM.el(`#version`)

    DOM.ev(version, `click`, () => {
        App.show_intro()
    })
}

App.update_title = () => {
    let color = App.capitalize(Colors.mode)
    document.title = `Curls - ${color}`
}

App.claim = () => {
    window.open(`/claim`, `_blank`)
}

App.start_mouse = () => {
    DOM.evs(DOM.el(`#main`), [`mousedown`], (e) => {
        if (!e.target.closest(`#curlist`)) {
            if (e.ctrlKey || e.shiftKey) {
                return
            }

            Curlist.deselect()

            if (!e.target.closest(`#peek`)) {
                Peek.hide()
            }
        }
    })
}

App.setup_resize = () => {
    window.addEventListener(`resize`, (event) => {
        Container.check_scroll()
    })
}

App.update_autocomplete = () => {
    let data_list = DOM.el(`#curls_datalist`)
    data_list.innerHTML = ``

    for (let word of Curls.get()) {
        var option = document.createElement(`option`)
        option.value = word
        data_list.append(option)
    }
}