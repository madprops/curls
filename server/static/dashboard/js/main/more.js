App.setup_more = () => {
    let button = DOM.el(`#footer_more`)

    DOM.ev(button, `click`, (e) => {
        App.show_more_menu(e)
    })

    DOM.ev(button, `auxclick`, (e) => {
        if (e.button == 1) {
            App.reset_more_options(e)
        }
    })

    let lines = [
        `More options`,
        `Middle Click to reset`,
    ]

    button.title = lines.join(`\n`)
}

App.more_change_highlight = (what) => {
    App.highlight_enabled = what
    App.save_highlight_enabled()
}

App.more_change_peek = (what) => {
    Peek.enabled = what
    Peek.save_enabled()
}

App.more_change_wrap = (what, actions = true) => {
    App.wrap_enabled = what
    App.save_wrap_enabled()

    if (actions) {
        App.update_items()
    }
}

App.more_change_controls = (what, actions = true) => {
    App.controls_enabled = what
    App.save_controls_enabled()

    if (actions) {
        App.check_controls()
    }
}

App.show_more_menu = (e) => {
    let items = []

    if (App.highlight_enabled) {
        items.push({
            text: `Disable Highlight`,
            action: () => {
                App.more_change_highlight(false)
            },
            info: `Disable the highlight effect on the container when selecting items in the curlist`,
        })
    }
    else {
        items.push({
            text: `Enable Highlight`,
            action: () => {
                App.more_change_highlight(true)
            },
            info: `Enable the highlight effect on the container when selecting items in the curlist`,
        })
    }

    if (Peek.enabled) {
        items.push({
            text: `Disable Peek`,
            action: () => {
                App.more_change_peek(false)
            },
            info: `Disable peek when selecting items in the curlist`,
        })
    }
    else {
        items.push({
            text: `Enable Peek`,
            action: () => {
                App.more_change_peek(true)
            },
            info: `Enable peek when selecting items in the curlist`,
        })
    }

    if (App.wrap_enabled) {
        items.push({
            text: `Disable Wrap`,
            action: () => {
                App.more_change_wrap(false)
            },
            info: `Disable text wrapping in the container`,
        })
    }
    else {
        items.push({
            text: `Enable Wrap`,
            action: () => {
                App.more_change_wrap(true)
            },
            info: `Enable text wrapping in the container`,
        })
    }

    if (App.controls_enabled) {
        items.push({
            text: `Disable Controls`,
            action: () => {
                App.more_change_controls(false)
            },
            info: `Disable the controls`,
        })
    }
    else {
        items.push({
            text: `Enable Controls`,
            action: () => {
                App.more_change_controls(true)
            },
            info: `Enable the controls`,
        })
    }

    NeedContext.show({items: items, e: e})
}

App.reset_more_options = () => {
    let vars = [
        App.highlight_enabled,
        Peek.enabled,
        App.wrap_enabled,
        App.controls_enabled,
    ]

    if (vars.every((x) => x)) {
        return
    }

    App.confirm({title: `Reset Options`, ok: () => {
        App.do_reset_more_options()
    }, message: `Reset all options to default`})
}

App.do_reset_more_options = () => {
    App.more_change_highlight(true)
    App.more_change_peek(true)
    App.more_change_wrap(true, false)
    App.more_change_controls(true, false)
    App.check_controls()
    App.update_items()
}