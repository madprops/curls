App.setup_more = () => {
    let button = DOM.el(`#footer_more`)

    DOM.ev(button, 'click', (e) => {
        App.show_more_menu(e)
    })
}

App.show_more_menu = (e) => {
    let items = []

    if (App.peek_enabled) {
        items.push({
            text: `Disable Peek`,
            action: () => {
                App.peek_enabled = false
                App.save_peek_enabled()
            }
        })
    }
    else {
        items.push({
            text: `Enable Peek`,
            action: () => {
                App.peek_enabled = true
                App.save_peek_enabled()
            }
        })
    }

    if (App.wrap_enabled) {
        items.push({
            text: `Disable Wrap`,
            action: () => {
                App.wrap_enabled = false
                App.save_wrap_enabled()
                App.update_items()
            }
        })
    }
    else {
        items.push({
            text: `Enable Wrap`,
            action: () => {
                App.wrap_enabled = true
                App.save_wrap_enabled()
                App.update_items()
            }
        })
    }

    if (App.controls_enabled) {
        items.push({
            text: `Disable Controls`,
            action: () => {
                App.controls_enabled = false
                App.save_controls_enabled()
                App.check_controls()
            }
        })
    }
    else {
        items.push({
            text: `Enable Controls`,
            action: () => {
                App.controls_enabled = true
                App.save_controls_enabled()
                App.check_controls()
            }
        })
    }

    NeedContext.show({items: items, e: e})
}