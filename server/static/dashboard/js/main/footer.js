class Footer {
    static setup() {
        let footer = DOM.el(`#footer`)

        DOM.ev(footer, `contextmenu`, (e) => {
            e.preventDefault()
            Menu.show(e)
        })

        DOM.ev(footer, `dblclick`, (e) => {
            if (e.target !== footer) {
                return
            }

            Curls.add()
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

        let lines = [
            `Right Click to show the main menu`,
            `Double Click to add curls`,
            `Wheel to scroll the container`,
        ]

        footer.title = lines.join(`\n`)
        let scroller = DOM.el(`#scroller`)

        DOM.ev(scroller, `click`, () => {
            Container.scroller()
        })

        let version = DOM.el(`#version`)

        DOM.ev(version, `click`, () => {
            Intro.show()
        })
    }
}