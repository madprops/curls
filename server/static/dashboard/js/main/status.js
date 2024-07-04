/*

This stores status items

*/

const Status = {
    max_list: 100,
    menu_max_length: 110,
    ls_name: `status_list`,
}

Status.setup = () => {
    let status = DOM.el(`#change_status`)
    let button = DOM.el(`#status_button`)

    DOM.ev(status, `keydown`, (e) => {
        if (e.key === `ArrowUp`) {
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            e.preventDefault()
        }
        else if (e.key === `Enter`) {
            Change.change()
        }
        else if (e.key === `Escape`) {
            status.value = ``
        }
    })

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `ArrowUp`) {
            Status.show_menu()
        }
        else if (e.key === `ArrowDown`) {
            Status.show_menu()
        }
    })

    status.value = ``

    DOM.ev(button, `click`, () => {
        Status.show_menu()
    })
}

Status.get_list = () => {
    let list = App.load_array(Status.ls_name)

    try {
        return JSON.parse(list)
    }
    catch (e) {
        return []
    }
}

Status.save = (status) => {
    let cleaned = []

    for (let item of Status.get_list()) {
        if (item !== status) {
            cleaned.push(item)
        }
    }

    let list = [status, ...cleaned].slice(0, Status.max_list)
    App.save(Status.ls_name, JSON.stringify(list))
}

Status.show_menu = () => {
    let status_list = Status.get_list()

    if (!status_list.length) {
        Windows.alert({title: `Empty List`, message: `Status items appear here after you use them`})
        return
    }

    let items = status_list.map(status => {
        return {
            text: status.substring(0, Status.menu_max_length),
            action: () => {
                Status.set(status)
            },
            alt_action: () => {
                Status.remove(status)
            },
        }
    })

    let el = DOM.el(`#change_status`)
    NeedContext.show({items: items, element: el})
}

Status.set = (status) => {
    let el = DOM.el(`#change_status`)
    el.value = status
    Status.focus()
}

Status.focus = () => {
    DOM.el(`#change_status`).focus()
}

Status.remove = (status) => {
    Windows.confirm({title: `Remove Status`, ok: () => {
        Status.do_remove(status)
    }, message: status.substring(0, 44)})
}

Status.do_remove = (status) => {
    let cleaned = []

    for (let status_ of Status.get_list()) {
        if (status_ === status) {
            continue
        }

        cleaned.push(status_)
    }

    App.save(Status.ls_name, JSON.stringify(cleaned))
}