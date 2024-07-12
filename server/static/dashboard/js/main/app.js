const App = {}

App.setup = () => {
    NeedContext.init()

    Block.setup()
    Curls.setup()
    Colors.setup()
    Infobar.setup()
    Container.setup()
    Select.setup()
    Drag.setup()
    Move.setup()
    Update.setup()
    Sort.setup()
    Change.setup()
    Picker.setup()
    Status.setup()
    Filter.setup()
    Menu.setup()
    More.setup()
    Font.setup()
    Border.setup()
    Dates.setup()
    Controls.setup()
    Windows.setup()
    Footer.setup()
    Intro.setup()
    Storage.setup()

    App.start_mouse()
    App.update_autocomplete()

    Update.do_update()
}

App.update_title = () => {
    let color = Utils.capitalize(Colors.mode)
    document.title = `Curls - ${color}`
}

App.start_mouse = () => {
    DOM.evs(DOM.el(`#main`), [`mousedown`], (e) => {
        App.check_selection(e)
    })

    DOM.ev(window, `mouseup`, (e) => {
        Select.mouseup()
    })
}

App.update_autocomplete = () => {
    let data_list = DOM.el(`#curls_datalist`)
    data_list.innerHTML = ``

    for (let word of Curls.get_curls()) {
        var option = document.createElement(`option`)
        option.value = word
        data_list.append(option)
    }
}

App.check_selection = (e) => {
    if (e.ctrlKey || e.shiftKey) {
        return
    }

    if (e.button !== 0) {
        return
    }

    if (e.target.closest(`.item_icon`)) {
        return
    }

    if (e.target.closest(`#infobar_curls`)) {
        return
    }

    Select.deselect_all()
}