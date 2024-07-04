App.setup_status = () => {
    let status = DOM.el(`#change_status`)

    DOM.ev(status, `keydown`, (e) => {
        if (e.key === `ArrowUp`) {
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            e.preventDefault()
        }
        else if (e.key === `Enter`) {
            App.change()
        }
        else if (e.key === `Escape`) {
            status.value = ``
        }
    })

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `ArrowUp`) {
            App.show_status_menu()
        }
        else if (e.key === `ArrowDown`) {
            App.show_status_menu()
        }
    })

    status.value = ``
}

App.get_status_list = () => {
    let list = App.load_array(`status_list`)

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
    App.save(`status_list`, JSON.stringify(list))
}

App.show_status_menu = () => {
    let status_list = App.get_status_list()

    if (!status_list.length) {
        return
    }

    let items = status_list.map(status => {
        return {
            text: status.substring(0, App.status_menu_max_length),
            action: () => {
                App.set_status(status)
            },
            alt_action: () => {
                App.remove_status(status)
            },
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

App.remove_status = (status) => {
    App.confirm({title: `Remove Status`, ok: () => {
        App.do_remove_status(status)
    }, message: status.substring(0, 44)})
}

App.do_remove_status = (status) => {
    let cleaned = []

    for (let status_ of App.get_status_list()) {
        if (status_ === status) {
            continue
        }

        cleaned.push(status_)
    }

    App.save(`status_list`, JSON.stringify(cleaned))
}