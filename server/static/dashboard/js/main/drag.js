/*

This is a generic way to add drag support to item lists

*/

class Drag {
    constructor(args) {
        this.drag_items = []
        this.drag_y = 0
        this.args = args
        this.add_events()
    }

    add_events() {
        DOM.ev(this.args.container, `dragstart`, (e) => {
            this.drag_start(e)
        })

        DOM.ev(this.args.container, `dragenter`, (e) => {
            this.drag_enter(e)
        })

        DOM.ev(this.args.container, `dragend`, (e) => {
            this.drag_end(e)
        })
    }

    drag_start(e) {
        if (this.args.locked()) {
            e.preventDefault()
            return false
        }

        let item = this.args.get_item(e)
        let curl = this.args.get_curl(item)
        this.drag_y = e.clientY

        e.dataTransfer.setData(`text`, curl)
        e.dataTransfer.setDragImage(new Image(), 0, 0)

        let selected = this.args.get_selected()

        if (selected.length && selected.includes(item)) {
            this.drag_items = selected
        }
        else {
            this.args.select(item)
            this.drag_items = [item]
        }

        this.args.started = true
    }

    drag_enter(e) {
        if (!this.args.started) {
            return
        }

        let items = this.args.get_items()
        let item = this.args.get_item(e)
        let index = items.indexOf(item)

        if (index === -1) {
            return
        }

        let direction = (e.clientY > this.drag_y) ? `down` : `up`
        this.drag_y = e.clientY

        if (direction === `up`) {
            item.before(...this.drag_items)
        }
        else if (direction === `down`) {
            item.after(...this.drag_items)
        }
    }

    drag_end(e) {
        this.args.on_end()
        this.args.started = false
    }
}