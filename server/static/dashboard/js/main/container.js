/*

This is the main container widget with the vertical items
Most action happens here

*/

class Container {
    static check_scroll_debouncer_delay = 100
    static wrap_enabled = true
    static highlight_debouncer_delay = 50
    static ls_wrap = `wrap_enabled`
    static selected_class = `selected`
    static selected_id = 0
    static scroll_step = 100

    static setup() {
        this.empty_info = [
            `Add some curls to the list on the left.`,
            `These will be monitored for status changes.`,
            `Above you can change the status of your own curls.`,
            `Each color has their own set of curls.`,
            `Click <a href="/claim" target="_blank">here</a> to claim your own curl.`,
        ].join(`<br>`)

        let outer = DOM.el(`#container_outer`)
        let container = DOM.el(`#container`)

        DOM.ev(container, `mousedown`, (e) => {
            let item = e.target.closest(`.item`)

            if (!item) {
                return
            }

            if (e.target.closest(`.item_updated`)) {
                Dates.change_mode()
                return
            }

            let curl = this.extract_curl(item)
            let selected = this.get_selected()

            if (selected.includes(item)) {
                if (!e.ctrlKey && !e.shiftKey) {
                    Items.show_menu({curl: curl, e: e})
                    return
                }
            }

            if (e.shiftKey && selected.length) {
                this.select_range(item)
                e.preventDefault()
            }
            else if (e.ctrlKey) {
                this.toggle_select(item)
                e.preventDefault()
            }
            else {
                if (e.target.closest(`.item_icon`)) {
                    this.select_single(item)
                    e.preventDefault()
                }
            }
        })

        DOM.ev(container, `auxclick`, (e) => {
            let item = e.target.closest(`.item`)

            if (!item) {
                return
            }

            if (e.button == 1) {
                let curl = this.extract_curl(item)
                this.check_select(item)
                Curls.remove_selected(curl)
            }
        })

        DOM.ev(container, `contextmenu`, (e) => {
            let item = e.target.closest(`.item`)

            if (!item) {
                return
            }

            let curl = this.extract_curl(item)
            this.check_select(item)
            Items.show_menu({curl: curl, e: e})
            e.preventDefault()
        })

        this.check_scroll_debouncer = Utils.create_debouncer(() => {
            this.do_check_scroll()
        }, this.check_scroll_debouncer_delay)

        DOM.ev(outer, `scroll`, (e) => {
            this.check_scroll()
        })

        let observer = new MutationObserver((list, observer) => {
            this.check_scroll()
        })

        observer.observe(container, { childList: true })
        this.drag_events()
        this.wrap_enabled = this.load_wrap_enabled()

        this.highlight_debouncer = Utils.create_debouncer((args) => {
            this.do_highlight(args)
        }, this.highlight_debouncer_delay)

        this.block = new Block(120)
        this.setup_keyboard()
    }

    static clear() {
        let container = DOM.el(`#container`)
        container.innerHTML = ``
    }

    static empty() {
        this.set_info(this.empty_info)
    }

    static check_empty() {
        let els = this.get_items()

        if (!els || !els.length) {
            this.empty()
        }
    }

    static loading() {
        this.set_info(`Loading...`)
    }

    static set_info(info) {
        let container = DOM.el(`#container`)
        let item = DOM.create(`div`, `info_item`)
        item.innerHTML = info
        container.innerHTML = ``
        container.append(item)
        Utils.deselect()
    }

    static get_items() {
        return DOM.els(`#container .item`)
    }

    static scroll_top() {
        let container = DOM.el(`#container_outer`)
        container.scrollTop = 0
    }

    static scroll_bottom() {
        let container = DOM.el(`#container_outer`)
        container.scrollTop = container.scrollHeight
    }

    static check_scroll() {
        this.check_scroll_debouncer.call()
    }

    static do_check_scroll() {
        this.check_scroll_debouncer.cancel()
        let outer = DOM.el(`#container_outer`)
        let top = DOM.el(`#scroller_top`)
        let bottom = DOM.el(`#scroller_bottom`)

        let height = outer.clientHeight
        let scroll = outer.scrollHeight
        let scrolltop = outer.scrollTop

        if (scrolltop > 0) {
            top.classList.remove(`disabled`)
        }
        else {
            top.classList.add(`disabled`)
        }

        if (scrolltop < (scroll - height)) {
            bottom.classList.remove(`disabled`)
        }
        else {
            bottom.classList.add(`disabled`)
        }
    }

    static drag_events() {
        let container = DOM.el(`#container`)

        new Drag({container: container,
            get_selected: () => {
                return this.get_selected()
            },
            get_items: () => {
                return this.get_items()
            },
            get_item: (e) => {
                return e.target.closest(`.item`)
            },
            get_curl: (item) => {
                return item.dataset.curl
            },
            on_end: () => {
                this.after_drag()
            },
            locked: () => {
                return false
            },
            select: (item) => {
                this.select_item(item)
            },
        })
    }

    static save_wrap_enabled() {
        Utils.save(this.ls_wrap, this.wrap_enabled)
    }

    static load_wrap_enabled() {
        return Utils.load_boolean(this.ls_wrap)
    }

    static add(items, curls) {
        let normal = Items.list.filter(item => !item.missing)
        Items.list = [...items]

        for (let item of normal) {
            if (Items.list.find(x => x.curl === item.curl)) {
                continue
            }

            Items.list.push(item)
        }

        let missing = Items.find_missing()
        Items.list.push(...missing)
        Dates.fill_items()
        this.update({select: curls})
    }

    static insert(items) {
        Items.list = items
        Items.list.map(x => x.missing = false)
        let missing = Items.find_missing()
        Items.list.push(...missing)
        Dates.fill_items()
        this.update()
    }

    static update(args = {}) {
        let def_args = {
            items: Items.list,
            check_filter: true,
            highlight: true,
            select: [],
        }

        Utils.def_args(def_args, args)
        Utils.info(`Updating Items`)
        this.clear()
        Sort.sort(args.items)

        for (let item of args.items) {
            this.create_element(item)
        }

        Utils.deselect()
        this.check_empty()

        if (args.check_filter) {
            Filter.check()
        }

        if (args.highlight) {
            this.highlight()
        }
    }

    static create_element(item) {
        let container = DOM.el(`#container`)
        let el = DOM.create(`div`, `item`)
        let item_icon = DOM.create(`div`, `item_icon`)
        item_icon.draggable = true

        let lines = [
            `Click to show menu`,
            `Middle Click to remove`,
            `Drag to reorder`,
        ]

        item_icon.title = lines.join(`\n`)

        let canvas = DOM.create(`canvas`, `item_icon_canvas`)
        jdenticon.update(canvas, item.curl)
        item_icon.append(canvas)

        let item_curl = DOM.create(`div`, `item_curl`)
        let item_status = DOM.create(`div`, `item_status`)

        if (!this.wrap_enabled) {
            item_status.classList.add(`nowrap`)
        }

        item_curl.textContent = item.curl
        item_curl.title = item.curl
        let status = item.status || `Not updated yet`
        item_status.innerHTML = Utils.sanitize(status)
        item_status.title = status
        Utils.urlize(item_status)
        let item_updated = DOM.create(`div`, `item_updated glow`)

        if (Dates.enabled) {
            item_updated.textContent = item.updated_text

            let lines_2 = [
                item.updated_text,
                `Click to toggle between 12 and 24 hours`,
            ]

            item_updated.title = lines_2.join(`\n`)
        }
        else {
            item_updated.classList.add(`hidden`)
        }

        el.append(item_icon)
        el.append(item_curl)
        el.append(item_status)
        el.append(item_updated)

        el.dataset.curl = item.curl

        container.append(el)
        container.append(el)

        item.element = el
    }

    static deselect() {
        let items = this.get_selected()

        for (let item of items) {
            this.deselect_item(item)
        }

        this.selected_id = 0
    }

    static highlight(args) {
        this.highlight_debouncer.call(args)
    }

    static do_highlight(args = {}) {
        this.highlight_debouncer.cancel()

        let def_args = {
            behavior: `smooth`,
        }

        Utils.def_args(def_args, args)
        let selected = this.get_selected_curls()

        for (let item of Items.list) {
            if (!item || !item.element) {
                continue
            }

            if (selected.includes(item.curl)) {
                this.select_item(item.element)
            }
            else {
                this.deselect_item(item.element)
            }
        }

        if (args.curl) {
            let item = Items.get(args.curl)

            if (item && item.element) {
                Utils.scroll_element({item: item.element, behavior: args.behavior})
            }
        }
    }

    static get_selected() {
        return DOM.els(`#container .item.${this.selected_class}`)
    }

    static extract_curl(item) {
        return item.dataset.curl
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

    static select_single(item) {
        let curl = this.extract_curl(item)
        this.deselect()
        this.selected_id = 0
        this.select_item(item)
        Peek.show({curl: curl})
    }

    static get_selected_curls() {
        let selected = this.get_selected()
        return selected.map(item => this.extract_curl(item))
    }

    static setup_keyboard() {
        let container = DOM.el(`#container`)

        DOM.ev(container, `keydown`, (e) => {
            if (e.key === `Delete`) {
                Curls.remove_selected()
                e.preventDefault()
            }
            else if (e.key === `ArrowUp`) {
                e.preventDefault()
                let selected = this.get_selected()

                if (selected.length) {
                    this.select_vertical(`up`, e.shiftKey)
                }
                else {
                    if (e.ctrlKey) {
                        this.scroll_top()
                        return
                    }

                    this.scroll_up()
                }
            }
            else if (e.key === `ArrowDown`) {
                e.preventDefault()
                let selected = this.get_selected()

                if (selected.length) {
                    this.select_vertical(`down`, e.shiftKey)
                }
                else {
                    if (e.ctrlKey) {
                        this.scroll_bottom()
                        return
                    }

                    this.scroll_down()
                }
            }
            else if (e.key === `Escape`) {
                Peek.hide()
                this.deselect()
                e.preventDefault()
            }
        })
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

        let items = this.get_visible()

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
        let items = this.get_visible()
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

    static get_prev_item() {
        let items = this.get_visible()
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

    static get_visible() {
        let items = this.get_items()
        return items.filter(x => !x.classList.contains(`hidden`))
    }

    static after_drag() {
        let curls = this.get_curls()
        Curls.save(curls)
        Sort.set_value(`order`)
    }

    static get_curls() {
        let items = this.get_items()
        return items.map(item => item.dataset.curl)
    }

    static scroll_up() {
        let container = DOM.el(`#container_outer`)
        container.scrollTop -= this.scroll_step
    }

    static scroll_down() {
        let container = DOM.el(`#container_outer`)
        container.scrollTop += this.scroll_step
    }

    static select_vertical(direction, shift) {
        if (this.block.add_charge()) {
            return
        }

        let items = this.get_visible()

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

    static get_item(curl) {
        let items = this.get_items()
        return items.find(x => x.dataset.curl === curl)
    }

    static select_curl(curl) {
        let item = this.get_item(curl)

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
}