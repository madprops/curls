class Footer {
    static setup() {
        let footer = DOM.el(`#footer`)

        DOM.ev(footer, `contextmenu`, (e) => {
            e.preventDefault()
            Menu.show(e)
        })

        DOM.ev(footer, `wheel`, (e) => {
            if (e.target !== footer) {
                return
            }

            let direction = Utils.wheel_direction(e)

            if (direction === `up`) {
                Container.scroll_up()
            }
            else {
                Container.scroll_down()
            }
        })

        footer.title = `Right click to show the main menu`
        let bottom = DOM.el(`#scroller_bottom`)

        DOM.ev(bottom, `click`, () => {
            Container.scroll_bottom()
            Container.do_check_scroll()
        })

        let version = DOM.el(`#version`)

        DOM.ev(version, `click`, () => {
            Intro.show()
        })
    }
}