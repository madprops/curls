App.setup_status = () => {
    let list = localStorage.getItem('status_list') || `[]`

    try {
        App.status_list = JSON.parse(list)
    }
    catch (e) {
        App.status_list = []
    }

    let status = DOM.el(`#change_status`)

    DOM.ev(status, `keydown`, (e) => {
        if (e.key === `ArrowUp`) {
            e.preventDefault()
        }
    })

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `Enter`) {
            App.change()
        }
        else if (e.key === `ArrowUp`) {
            App.show_status_menu(e)
        }
    })

    status.value = ``
}

App.save_status = (status) => {
    let cleaned = []

    for (let item of App.status_list) {
        if (item !== status) {
            cleaned.push(item)
        }
    }

    App.status_list = [status, ...cleaned].slice(0, App.max_status_list)
    localStorage.setItem(`status_list`, JSON.stringify(App.status_list))
}

App.show_status_menu = (e) => {
    if (!App.status_list.length) {
        return
    }

    let items = App.status_list.map(status => {
        return {
            text: status,
            action: () => {
                App.set_status(status)
            }
        }
    })

    NeedContext.show({items: items, e: e})
}

App.set_status = (status) => {
    let el = DOM.el(`#change_status`)
    el.value = status
    el.focus()
}