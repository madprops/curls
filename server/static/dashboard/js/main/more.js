/*

This is a button that sits on the footer
It is used to toggle some options

*/

const More = {}

More.setup = () => {
    let button = DOM.el(`#footer_more`)

    DOM.ev(button, `click`, (e) => {
        More.show_menu(e)
    })

    DOM.ev(button, `auxclick`, (e) => {
        if (e.button == 1) {
            More.reset(e)
        }
    })

    let lines = [
        `More options`,
        `Middle Click to reset`,
    ]

    button.title = lines.join(`\n`)
}

More.change_highlight = (what) => {
    Container.highlight_enabled = what
    Container.save_highlight_enabled()
}

More.change_peek = (what) => {
    Peek.enabled = what
    Peek.save_enabled()
}

More.change_wrap = (what, actions = true) => {
    Container.wrap_enabled = what
    Container.save_wrap_enabled()

    if (actions) {
        Container.update()
    }
}

More.change_controls = (what, actions = true) => {
    App.controls_enabled = what
    App.save_controls_enabled()

    if (actions) {
        App.check_controls()
    }
}

More.show_menu = (e) => {
    let items = []

    if (Container.highlight_enabled) {
        items.push({
            text: `Disable Highlight`,
            action: () => {
                More.change_highlight(false)
            },
            info: `Disable the highlight effect on the container when selecting items in the curlist`,
        })
    }
    else {
        items.push({
            text: `Enable Highlight`,
            action: () => {
                More.change_highlight(true)
            },
            info: `Enable the highlight effect on the container when selecting items in the curlist`,
        })
    }

    if (Peek.enabled) {
        items.push({
            text: `Disable Peek`,
            action: () => {
                More.change_peek(false)
            },
            info: `Disable peek when selecting items in the curlist`,
        })
    }
    else {
        items.push({
            text: `Enable Peek`,
            action: () => {
                More.change_peek(true)
            },
            info: `Enable peek when selecting items in the curlist`,
        })
    }

    if (Container.wrap_enabled) {
        items.push({
            text: `Disable Wrap`,
            action: () => {
                More.change_wrap(false)
            },
            info: `Disable text wrapping in the container`,
        })
    }
    else {
        items.push({
            text: `Enable Wrap`,
            action: () => {
                More.change_wrap(true)
            },
            info: `Enable text wrapping in the container`,
        })
    }

    if (App.controls_enabled) {
        items.push({
            text: `Disable Controls`,
            action: () => {
                More.change_controls(false)
            },
            info: `Disable the controls`,
        })
    }
    else {
        items.push({
            text: `Enable Controls`,
            action: () => {
                More.change_controls(true)
            },
            info: `Enable the controls`,
        })
    }

    NeedContext.show({items: items, e: e})
}

More.reset = () => {
    let vars = [
        Container.highlight_enabled,
        Peek.enabled,
        Container.wrap_enabled,
        App.controls_enabled,
    ]

    if (vars.every((x) => x)) {
        return
    }

    App.confirm({title: `Reset Options`, ok: () => {
        More.do_reset()
    }, message: `Reset all options to default`})
}

More.do_reset = () => {
    More.change_highlight(true)
    More.change_peek(true)
    More.change_wrap(true, false)
    More.change_controls(true, false)
    App.check_controls()
    Container.update()
}