/*

Used for selecting items in the container

*/

class Select {
    static selected_class = `selected`
    static selected_id = 0
    static mouse_down = false
    static mouse_selected = false

    static setup() {
        this.block = new Block(200)
    }

    static select_curl(curl) {
        let item = Container.get_item(curl)

        if (item) {
            this.select_item(item)
        }
    }

    static select_curls(curls) {
        for (let curl of curls) {
            this.select_curl(curl)
        }
    }

    static check_select(item) {
        let selected = this.get_selected()

        if (!selected.includes(item)) {
            this.select_single(item)
        }
    }

    static select_range(item) {
        let selected = this.get_selected()

        if (!selected.length) {
            Select.select_single(item)
            return
        }

        let prev_item = this.get_prev_item()

        if (item === prev_item) {
            return
        }

        let items = Container.get_visible()

        if (!items.length) {
            return
        }

        let index = items.indexOf(item)
        let prev_index = items.indexOf(prev_item)
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
            if (prev_item === selected[0]) {
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
            this.do_select_range(index, prev_index, direction)
        }
        else {
            this.do_select_range(prev_index, index, direction)
        }
    }

    static do_select_range(start, end, direction) {
        let items = Container.get_visible()
        let select = []

        for (let i = 0; i < items.length; i++) {
            if (i < start) {
                if (direction === `up`) {
                    this.deselect_item(items[i])
                }

                continue
            }

            if (i > end) {
                if (direction === `down`) {
                    this.deselect_item(items[i])
                }

                continue
            }

            select.push(items[i])
        }

        if (direction === `up`) {
            select.reverse()
        }

        for (let item of select) {
            this.select_item(item)
        }
    }

    static select_vertical(direction, shift) {
        if (this.block.add_charge()) {
            return
        }

        let items = Container.get_visible()

        if (!items.length) {
            return
        }

        let selected = this.get_selected()
        let prev_item = this.get_prev_item()
        let prev_index = items.indexOf(prev_item)
        let first_index = items.indexOf(selected[0])

        if (!selected.length) {
            let item

            if (direction === `up`) {
                item = Utils.last(items)
            }
            else if (direction === `down`) {
                item = items[0]
            }

            this.select_single(item)
            return
        }

        if (direction === `up`) {
            if (shift) {
                let item = items[prev_index - 1]

                if (!item) {
                    return
                }

                this.select_range(item)
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

                this.select_single(item)
            }
        }
        else if (direction === `down`) {
            if (shift) {
                let item = items[prev_index + 1]

                if (!item) {
                    return
                }

                this.select_range(item)
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

                this.select_single(item)
            }
        }
    }

    static get_prev_item() {
        let items = Container.get_visible()
        let prev_item = null

        for (let item of items) {
            if (!prev_item) {
                prev_item = item
                continue
            }

            let id = parseInt(item.dataset.selected_id) || 0
            let id_ = parseInt(prev_item.dataset.selected_id) || 0

            if (id > id_) {
                prev_item = item
            }
        }

        return prev_item
    }

    static get_selected() {
        return DOM.els(`#container .item.${this.selected_class}`)
    }

    static get_selected_curls() {
        let selected = this.get_selected()
        return selected.map(item => Container.extract_curl(item))
    }

    static select_item(item) {
        item.classList.add(this.selected_class)
        this.selected_id += 1
        item.dataset.selected_id = this.selected_id
        Utils.scroll_element({item: item})
    }

    static deselect_item(item) {
        item.classList.remove(this.selected_class)
        item.dataset.selected_id = 0
    }

    static toggle_select(item) {
        if (item.classList.contains(this.selected_class)) {
            this.deselect_item(item)
        }
        else {
            this.select_item(item)
        }
    }

    static deselect() {
        let items = this.get_selected()

        for (let item of items) {
            this.deselect_item(item)
        }

        this.selected_id = 0
    }

    static select_single(item) {
        this.deselect()
        this.selected_id = 0
        this.select_item(item)
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
                this.deselect_item(items[i])
            }
            else {
                this.select_item(items[i])
            }
        }
    }
}
