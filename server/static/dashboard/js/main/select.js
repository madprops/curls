/*

Used for selecting items in the container

*/

class Select {
    static selected_class = `selected`
    static selected_id = 0
    static mouse_down = false
    static mouse_selected = false

    static setup() {
        this.block = new Block()
    }

    static curl(curl) {
        let item = Container.get_item(curl)

        if (item) {
            this.select(item)
        }
    }

    static curls(curls) {
        for (let curl of curls) {
            this.curl(curl)
        }
    }

    static check(item) {
        let selected = this.get()

        if (!selected.includes(item)) {
            this.single(item)
        }
    }

    static range(item) {
        let selected = this.get()

        if (!selected.length) {
            Select.single(item)
            return
        }

        let prev = this.get_prev()

        if (item === prev) {
            return
        }

        let items = Container.get_visible()

        if (!items.length) {
            return
        }

        let index = items.indexOf(item)
        let prev_index = items.indexOf(prev)
        let first_index = items.indexOf(selected[0])
        let last_index = items.indexOf(Utils.last(selected))
        let direction

        if (selected.length === 1) {
            if (index < prev_index) {
                direction = `up`
            }
            else {
                direction = `down`
            }
        }
        else {
            if (prev === selected[0]) {
                direction = `up`
            }
            else {
                direction = `down`
            }
        }

        if (index > last_index) {
            direction = `down`
        }
        else if (index < first_index) {
            direction = `up`
        }

        if (direction === `up`) {
            this.do_range(index, prev_index, direction)
        }
        else {
            this.do_range(prev_index, index, direction)
        }
    }

    static do_range(start, end, direction) {
        let items = Container.get_visible()
        let select = []

        for (let i = 0; i < items.length; i++) {
            if (i < start) {
                if (direction === `up`) {
                    this.deselect(items[i])
                }

                continue
            }

            if (i > end) {
                if (direction === `down`) {
                    this.deselect(items[i])
                }

                continue
            }

            select.push(items[i])
        }

        if (direction === `up`) {
            select.reverse()
        }

        for (let item of select) {
            this.select(item)
        }
    }

    static vertical(direction, shift) {
        if (this.block.add_charge()) {
            return
        }

        let items = Container.get_visible()

        if (!items.length) {
            return
        }

        let selected = this.get()
        let prev = this.get_prev()
        let prev_index = items.indexOf(prev)
        let first_index = items.indexOf(selected[0])

        if (!selected.length) {
            let item

            if (direction === `up`) {
                item = Utils.last(items)
            }
            else if (direction === `down`) {
                item = items[0]
            }

            this.single(item)
            return
        }

        if (direction === `up`) {
            if (shift) {
                let item = items[prev_index - 1]

                if (!item) {
                    return
                }

                this.range(item)
            }
            else {
                let item

                if (selected.length > 1) {
                    item = selected[0]
                }
                else {
                    let index = first_index - 1

                    if (index < 0) {
                        index = items.length - 1
                    }

                    item = items[index]
                }

                if (!item) {
                    return
                }

                this.single(item)
            }
        }
        else if (direction === `down`) {
            if (shift) {
                let item = items[prev_index + 1]

                if (!item) {
                    return
                }

                this.range(item)
            }
            else {
                let item

                if (selected.length > 1) {
                    item = Utils.last(selected)
                }
                else {
                    let index = first_index + 1

                    if (index >= items.length) {
                        index = 0
                    }

                    item = items[index]
                }

                if (!item) {
                    return
                }

                this.single(item)
            }
        }
    }

    static get_prev() {
        let items = Container.get_visible()
        let prev = null

        for (let item of items) {
            if (!prev) {
                prev = item
                continue
            }

            let id = parseInt(item.dataset.selected_id) || 0
            let id_ = parseInt(prev.dataset.selected_id) || 0

            if (id > id_) {
                prev = item
            }
        }

        return prev
    }

    static get() {
        return DOM.els(`#container .item.${this.selected_class}`)
    }

    static get_curls() {
        let selected = this.get()
        return selected.map(item => Container.extract_curl(item))
    }

    static select(item) {
        item.classList.add(this.selected_class)
        this.selected_id += 1
        item.dataset.selected_id = this.selected_id
        Utils.scroll_element({item: item})
        Header.update_curls()
    }

    static deselect(item) {
        item.classList.remove(this.selected_class)
        item.dataset.selected_id = 0
        Header.update_curls()
    }

    static toggle(item) {
        if (item.classList.contains(this.selected_class)) {
            this.deselect(item)
        }
        else {
            this.select(item)
        }
    }

    static deselect_all() {
        let items = this.get()

        for (let item of items) {
            this.deselect(item)
        }

        this.selected_id = 0
    }

    static single(item) {
        this.deselect_all()
        this.selected_id = 0
        this.select(item)
    }

    static mousedown(e) {
        let item = Container.extract_item(e)

        if (item) {
            return
        }

        this.mouse_down = true
        this.mouse_selected = false
        e.preventDefault()
    }

    static mouseup() {
        this.mouse_down = false
        this.mouse_selected = false
    }

    static mouseover(e) {
        if (!this.mouse_down) {
            return
        }

        let item = Container.extract_item(e)

        if (!item) {
            return
        }

        let items = Container.get_visible()
        let index = items.indexOf(item)

        for (let i = 0; i < items.length; i++) {
            if (i < index) {
                this.deselect(items[i])
            }
            else {
                this.select(items[i])
            }
        }
    }

    static all() {
        let items = Container.get_items()

        for (let item of items) {
            Select.select(item)
        }
    }
}
