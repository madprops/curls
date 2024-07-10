/*

This is the main container widget with the vertical items
Most action happens here

*/

class Container {
    static wrap_enabled = true
    static ls_wrap = `wrap_enabled`
    static scroll_step = 100

    static setup() {
        this.empty_info = [
            `Add some curls to the list by using the menu.`,
            `These will be monitored for status changes.`,
            `Above you can change the status of your own curls.`,
            `Each color has its own set of curls.`,
        ].join(`<br>`)

        let outer = this.get_outer()
        let container = this.get_container()

        DOM.ev(container, `mousedown`, (e) => {
            if (e.ctrlKey || e.shiftKey) {
                e.preventDefault()
            }
        })

        DOM.ev(container, `click`, (e) => {
            let item = this.extract_item(e)

            if (!item) {
                return
            }

            if (this.extract_updated(e)) {
                Dates.change_mode()
                return
            }

            this.focus()
            let is_icon = this.extract_icon(e)

            if (e.shiftKey) {
                Select.range(item)
                e.preventDefault()
            }
            else if (e.ctrlKey) {
                Select.toggle(item)
                e.preventDefault()
            }
            else {
                if (is_icon) {
                    Select.single(item)
                    e.preventDefault()
                }
            }
        })

        DOM.ev(container, `auxclick`, (e) => {
            let item = this.extract_item(e)

            if (!item) {
                return
            }

            if (e.button == 1) {
                let curl = this.extract_curl(item)
                Select.check(item)
                Curls.remove_selected(curl)
            }
        })

        DOM.ev(container, `contextmenu`, (e) => {
            let item = this.extract_item(e)

            if (!item) {
                return
            }

            let curl = this.extract_curl(item)
            Select.check(item)
            Items.show_menu({curl: curl, e: e})
            e.preventDefault()
        })

        DOM.ev(outer, `contextmenu`, (e) => {
            let item = this.extract_item(e)
            e.preventDefault()

            if (item) {
                return
            }

            Menu.show(e)
        })

        DOM.ev(outer, `click`, (e) => {
            this.focus()
        })

        DOM.ev(outer, `mousedown`, (e) => {
            Select.mousedown(e)
        })

        DOM.ev(outer, `mouseup`, () => {
            Select.mouseup()
        })

        DOM.ev(outer, `mouseover`, (e) => {
            Select.mouseover(e)
        })

        this.wrap_enabled = this.load_wrap_enabled()
        this.setup_keyboard()
        this.focus()
    }

    static clear() {
        let container = this.get_container()
        container.innerHTML = ``
    }

    static show_empty() {
        Infobar.hide()
        this.set_info(this.empty_info)
    }

    static check_empty() {
        let els = this.get_items()

        if (!els || !els.length) {
            this.show_empty()
        }
    }

    static show_loading() {
        this.set_info(`Loading...`)
    }

    static set_info(info) {
        let container = this.get_container()
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
        let item = this.get_items()[0]
        Utils.scroll_element({item: item, behavior: `smooth`, block: `center`})
    }

    static scroll_bottom() {
        let item = Utils.last(this.get_items())
        Utils.scroll_element({item: item, behavior: `smooth`, block: `center`})
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
        Items.fill()
        this.update({select: curls})
    }

    static insert(items) {
        Items.list = items
        Items.list.map(x => x.missing = false)
        let missing = Items.find_missing()
        Items.list.push(...missing)
        Items.fill()
        this.update()
    }

    static update(args = {}) {
        let def_args = {
            items: Items.list,
            check_filter: true,
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

        if (args.select.length) {
            Select.curls(args.select)
        }

        Infobar.update()
    }

    static create_element(item) {
        let container = this.get_container()
        let el = DOM.create(`div`, `item`)
        let item_icon = DOM.create(`div`, `item_icon`)
        item_icon.draggable = true

        let lines = [
            `Click to select`,
            `Ctrl Click to toggle`,
            `Shift Click to select range`,
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
        Utils.urlize(item_status)
        let item_updated = DOM.create(`div`, `item_updated glow`)

        if (Dates.enabled) {
            item_status.title = status
            item_updated.textContent = item.updated_text

            let lines_2 = [
                `Added: ${item.added}`,
                `Updated: ${item.updated_text}`,
                `Click to toggle between 12 and 24 hours`,
            ]

            item_updated.title = lines_2.join(`\n`)
        }
        else {
            item_status.title = `${item.updated_text}\n${status}`
            item_updated.classList.add(`hidden`)
        }

        item_status.title += `\nChanges: ${item.changes || 0}`

        el.append(item_icon)
        el.append(item_curl)
        el.append(item_status)
        el.append(item_updated)

        el.dataset.curl = item.curl
        el.dataset.selected_id = 0

        container.append(el)
        container.append(el)

        item.element = el
    }

    static extract_curl(item) {
        return item.dataset.curl
    }

    static setup_keyboard() {
        let container = this.get_container()

        DOM.ev(container, `keydown`, (e) => {
            if (e.key === `Delete`) {
                Curls.remove_selected()
                e.preventDefault()
            }
            else if (e.key === `ArrowUp`) {
                if (e.ctrlKey) {
                    Move.up()
                }
                else {
                    Select.vertical(`up`, e.shiftKey)
                }

                e.preventDefault()
            }
            else if (e.key === `ArrowDown`) {
                if (e.ctrlKey) {
                    Move.down()
                }
                else {
                    Select.vertical(`down`, e.shiftKey)
                }

                e.preventDefault()
            }
            else if (e.key === `ArrowLeft`) {
                if (e.ctrlKey) {
                    Colors.prev()
                    e.preventDefault()
                }
            }
            else if (e.key === `ArrowRight`) {
                if (e.ctrlKey) {
                    Colors.next()
                    e.preventDefault()
                }
            }
            else if (e.key === `Escape`) {
                Select.deselect_all()
                e.preventDefault()
            }
            else if (e.key === `a`) {
                if (e.ctrlKey) {
                    Select.all()
                    e.preventDefault()
                }
            }
        })
    }

    static is_visible(item) {
        return !item.classList.contains(`hidden`)
    }

    static get_visible() {
        let items = this.get_items()
        return items.filter(x => this.is_visible(x))
    }

    static get_curls() {
        let items = this.get_items()
        return items.map(item => Container.extract_curl(item))
    }

    static get_item(curl) {
        let items = this.get_items()
        return items.find(x => x.dataset.curl === curl)
    }

    static focus() {
        this.get_container().focus()
    }

    static get_outer() {
        return DOM.el(`#container_outer`)
    }

    static get_container() {
        return DOM.el(`#container`)
    }

    static extract_item(e) {
        return e.target.closest(`.item`)
    }

    static extract_icon(e) {
        return e.target.closest(`.item_icon`)
    }

    static extract_updated(e) {
        return e.target.closest(`.item_updated`)
    }

    static scroll_up() {
        let outer = this.get_outer()
        outer.scrollBy(0, -this.scroll_step)
    }

    static scroll_down() {
        let outer = this.get_outer()
        outer.scrollBy(0, this.scroll_step)
    }

    static scroller() {
        let outer = this.get_outer()
        let height = outer.clientHeight
        let scroll = outer.scrollHeight
        let scrolltop = outer.scrollTop

        if (scrolltop < (scroll - height)) {
            this.scroll_bottom()
        }
        else {
            this.scroll_top()
        }
    }

    static scroll(e) {
        let direction = Utils.wheel_direction(e)

        if (direction === `up`) {
            Container.scroll_up()
        }
        else {
            Container.scroll_down()
        }
    }
}