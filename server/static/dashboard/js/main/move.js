/*

Moves items up and down in the container

*/

class Move {
    static up() {
        let items = Container.get_visible()
        let selected = Select.get()
        let first_index = items.indexOf(selected[0])
        let prev

        if (first_index === 0) {
            prev = items[first_index]
        }
        else {
            prev = items[first_index - 1]
        }

        prev.before(...selected)
        Utils.scroll_element({item: selected[0]})
        this.save()
    }

    static down() {
        let items = Container.get_visible()
        let selected = Select.get()
        let last_index = items.indexOf(Utils.last(selected))
        let next

        if (last_index === items.length - 1) {
            next = items[last_index]
        }
        else {
            next = items[last_index + 1]
        }

        next.after(...selected)
        Utils.scroll_element({item: Utils.last(selected)})
        this.save()
    }

    static save() {
        Container.save_curls()
        Sort.set_value(`order`)
    }
}