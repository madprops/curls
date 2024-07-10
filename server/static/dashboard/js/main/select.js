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
            this.single(item)
            return
        }

        let items = Container.get_visible()

        if (items.length <= 1) {
            return
        }

        let history = this.history()
        let prev = history[0]
        let prev_prev = history[1] || prev

        if (item === prev) {
            return
        }

        let index = items.indexOf(item)
        let prev_index = items.indexOf(prev)
        let prev_prev_index = items.indexOf(prev_prev)
        let direction

        if (prev_index === prev_prev_index) {
            if (index < prev_index) {
                direction = `up`
            }
            else {
                direction = `down`
            }
        }
        else if (prev_index < prev_prev_index) {
            direction = `up`
        }
        else {
            direction = `down`
        }

        let action = (a, b) => {
            this.do_range(a, b, direction)
        }

        if (direction === `up`) {
            if (index < prev_index) {
                action(index, prev_index)
            }
            else {
                action(index, prev_prev_index)
            }
        }
        else if (direction === `down`) {
            if (index > prev_index) {
                action(prev_index, index)
            }
            else {
                action(prev_prev_index, index)
            }
        }

        this.id_item(item)
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

        if (items.length === 1) {
            this.single(items[0])
            return
        }

        let selected = this.get()
        let history = this.history()
        let prev = history[0]
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

    static history() {
        let items = this.get()

        items = items.filter(item => {
            return parseInt(item.dataset.selected_id) > 0
        })

        items.sort((a, b) => {
            return parseInt(b.dataset.selected_id) - parseInt(a.dataset.selected_id)
        })

        return items
    }

    static get() {
        return DOM.els(`#container .item.${this.selected_class}`)
    }

    static get_curls() {
        let selected = this.get()
        return selected.map(item => Container.extract_curl(item))
    }

    static id_item(item) {
        this.selected_id += 1
        item.dataset.selected_id = this.selected_id
    }

    static select(item, set_id = false) {
        item.classList.add(this.selected_class)

        if (set_id) {
            this.id_item(item)
        }

        Utils.scroll_element({item: item})
        Infobar.update_curls()
    }

    static deselect(item) {
        item.classList.remove(this.selected_class)
        item.dataset.selected_id = 0
        Infobar.update_curls()
    }

    static toggle(item) {
        if (item.classList.contains(this.selected_class)) {
            this.deselect(item)
        }
        else {
            this.select(item, true)
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
        this.select(item, true)
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
            if (Container.is_visible(item)) {
                this.select(item)
            }
            else {
                this.deselect(item)
            }
        }
    }

    static toggle_all() {
        let visible = Container.get_visible()
        let selected = this.get()

        if (selected.length === visible.length) {
            this.deselect_all()
        }
        else {
            this.all()
        }
    }
}
