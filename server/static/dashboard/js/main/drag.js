/*

Controls dragging of items in the container

*/

class Drag {
    static drag_items = []
    static drag_y = 0

    static setup() {
        let container = Container.get_container()

        DOM.ev(container, `dragstart`, (e) => {
            this.drag_start(e)
        })

        DOM.ev(container, `dragenter`, (e) => {
            this.drag_enter(e)
        })

        DOM.ev(container, `dragend`, (e) => {
            this.drag_end(e)
        })
    }

    static drag_start(e) {
        let item = Container.extract_item(e)
        let curl = Container.extract_curl(item)
        this.drag_y = e.clientY

        e.dataTransfer.setData(`text`, curl)
        e.dataTransfer.setDragImage(new Image(), 0, 0)

        let selected = Select.get()

        if (selected.length && selected.includes(item)) {
            this.drag_items = selected
        }
        else {
            if (!selected.includes(item)) {
                Select.single(item)
            }

            this.drag_items = [item]
        }
    }

    static drag_enter(e) {
        let items = Container.get_items()
        let item = Container.extract_item(e)
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

    static drag_end(e) {
        if (Container.save_curls()) {
            Sort.set_value(`order`)
        }
    }
}