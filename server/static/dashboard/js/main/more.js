App.setup_more = () => {
    let button = DOM.el(`#footer_more`)

    DOM.ev(button, 'click', (e) => {
        App.show_more_menu(e)
    })
}

App.show_more_menu = (e) => {
    let items = []

    if (App.highlight_enabled) {
        items.push({
            text: `Disable Highlight`,
            action: () => {
                App.highlight_enabled = false
                App.save_highlight_enabled()
            },
            info: `Disable the highlight effect on the container when selecting items in the curlist`,
        })
    }
    else {
        items.push({
            text: `Enable Highlight`,
            action: () => {
                App.highlight_enabled = true
                App.save_highlight_enabled()
            },
            info: `Enable the highlight effect on the container when selecting items in the curlist`,
        })
    }

    if (App.peek_enabled) {
        items.push({
            text: `Disable Peek`,
            action: () => {
                App.peek_enabled = false
                App.save_peek_enabled()
            },
            info: `Disable peek when selecting items in the curlist`,
        })
    }
    else {
        items.push({
            text: `Enable Peek`,
            action: () => {
                App.peek_enabled = true
                App.save_peek_enabled()
            },
            info: `Enable peek when selecting items in the curlist`,
        })
    }

    if (App.wrap_enabled) {
        items.push({
            text: `Disable Wrap`,
            action: () => {
                App.wrap_enabled = false
                App.save_wrap_enabled()
                App.update_items()
            },
            info: `Disable text wrapping in the container`,
        })
    }
    else {
        items.push({
            text: `Enable Wrap`,
            action: () => {
                App.wrap_enabled = true
                App.save_wrap_enabled()
                App.update_items()
            },
            info: `Enable text wrapping in the container`,
        })
    }

    if (App.controls_enabled) {
        items.push({
            text: `Disable Controls`,
            action: () => {
                App.controls_enabled = false
                App.save_controls_enabled()
                App.check_controls()
            },
            info: `Disable the controls`,
        })
    }
    else {
        items.push({
            text: `Enable Controls`,
            action: () => {
                App.controls_enabled = true
                App.save_controls_enabled()
                App.check_controls()
            },
            info: `Enable the controls`,
        })
    }

    NeedContext.show({items: items, e: e})
}