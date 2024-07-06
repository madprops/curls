class Drag {
    static drag_items = []
    static drag_y = 0

    static register(args = {}) {
        DOM.ev(args.container, `dragstart`, (e) => {
            let item = args.get_item(e)
            let curl = args.get_curl(item)
            this.drag_y = e.clientY

            e.dataTransfer.setData(`text`, curl)
            e.dataTransfer.setDragImage(new Image(), 0, 0)

            let selected = args.get_selected()

            if (selected.length && selected.includes(item)) {
                this.drag_items = selected
            }
            else {
                Curlist.select_item(item)
                this.drag_items = [item]
            }
        })

        DOM.ev(args.container, `dragenter`, (e) => {
            let items = args.get_items()
            let item = args.get_item(e)
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
        })

        DOM.ev(args.container, `dragend`, (e) => {
            args.on_end()
        })
    }
}