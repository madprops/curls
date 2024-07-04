App.setup = () => {
    NeedContext.init()
    Block.setup()
    App.setup_buttons()
    App.setup_color()
    Curlist.setup()
    App.setup_container()
    App.setup_items()
    App.setup_updater()
    App.setup_sort()
    App.setup_change()
    App.setup_picker()
    App.setup_status()
    App.setup_filter()
    Peek.setup()
    App.start_mouse()
    More.setup()
    App.setup_font()
    App.setup_border()
    App.setup_controls()
    App.setup_resize()
    App.setup_windows()
    App.update_autocomplete()
    App.setup_intro()
    App.update()
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
        App.scroll_container_top()
        App.do_check_scroll()
    })

    let bottom = DOM.el(`#scroller_bottom`)

    DOM.ev(bottom, `click`, () => {
        App.scroll_container_bottom()
        App.do_check_scroll()
    })

    let version = DOM.el(`#version`)

    DOM.ev(version, `click`, () => {
        App.show_intro()
    })
}

App.update_title = () => {
    let color = App.capitalize(App.color_mode)
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
        App.check_scroll()
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