App.setup_status = () => {
    let status = DOM.el(`#change_status`)

    DOM.ev(status, `keydown`, (e) => {
        if (e.key === `ArrowUp`) {
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            e.preventDefault()
        }
    })

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `Enter`) {
            App.change()
        }
        else if (e.key === `ArrowUp`) {
            App.show_status_menu()
        }
        else if (e.key === `ArrowDown`) {
            App.show_status_menu()
        }
    })

    status.value = ``
}

App.get_status_list = () => {
    let list = localStorage.getItem('status_list') || `[]`

    try {
        return JSON.parse(list)
    }
    catch (e) {
        return []
    }
}

App.save_status = (status) => {
    let cleaned = []

    for (let item of App.get_status_list()) {
        if (item !== status) {
            cleaned.push(item)
        }
    }

    let list = [status, ...cleaned].slice(0, App.max_status_list)
    localStorage.setItem(`status_list`, JSON.stringify(list))
}

App.show_status_menu = () => {
    let status_list = App.get_status_list()

    if (!status_list.length) {
        return
    }

    let items = status_list.map(status => {
        return {
            text: status,
            action: () => {
                App.set_status(status)
            }
        }
    })

    let el = DOM.el(`#change_status`)
    NeedContext.show({items: items, element: el})
}

App.set_status = (status) => {
    let el = DOM.el(`#change_status`)
    el.value = status
    App.focus_status()
}

App.focus_status = () => {
    DOM.el(`#change_status`).focus()
}