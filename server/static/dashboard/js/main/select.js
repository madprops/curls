/*

Used for selecting items in the container

*/

class Select {
    static selected_class = `selected`
    static selected_id = 0

    static setup() {
        this.block = new Block(120)
    }

    static select_curl(curl) {
        let item = Container.get_item(curl)

        if (item) {
            this.select_item(item)
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
            this.do_select_range(item, index, prev_index, direction)
        }
        else {
            this.do_select_range(item, prev_index, index, direction)
        }
    }

    static do_select_range(item, start, end, direction) {
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

            let id = parseInt(item.dataset.selected_id)
            let prev_id = parseInt(prev_item.dataset.selected_id)

            if (id > prev_id) {
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
        let curl = Container.extract_curl(item)
        this.deselect()
        this.selected_id = 0
        this.select_item(item)
        Peek.show({curl: curl})
    }
}
