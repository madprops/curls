/*

This is the main container widget with the vertical items
Most action happens here

*/

class Container {
    static check_scroll_debouncer_delay = 100
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

        this.check_scroll_debouncer = Utils.create_debouncer(() => {
            this.do_check_scroll()
        }, this.check_scroll_debouncer_delay)

        DOM.ev(outer, `scroll`, (e) => {
            this.check_scroll()
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

        let observer = new MutationObserver((list, observer) => {
            this.check_scroll()
        })

        observer.observe(container, { childList: true })
        this.drag_events()
        this.wrap_enabled = this.load_wrap_enabled()
        this.setup_keyboard()
        this.focus()
    }

    static clear() {
        let container = this.get_container()
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
        let container = this.get_outer()
        container.scrollTop = 0
    }

    static scroll_bottom() {
        let container = this.get_outer()
        container.scrollTop = container.scrollHeight
    }

    static check_scroll() {
        this.check_scroll_debouncer.call()
    }

    static do_check_scroll() {
        this.check_scroll_debouncer.cancel()
        let outer = this.get_outer()
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
        let container = this.get_container()

        new Drag({container: container,
            get_selected: () => {
                return Select.get()
            },
            get_items: () => {
                return this.get_items()
            },
            get_item: (e) => {
                return this.extract_item(e)
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
                let selected = Select.get()

                if (!selected.includes(item)) {
                    Select.single(item)
                }
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
    }

    static create_element(item) {
        let container = this.get_container()
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
        Utils.urlize(item_status)
        let item_updated = DOM.create(`div`, `item_updated glow`)

        if (Dates.enabled) {
            item_status.title = status
            item_updated.textContent = item.updated_text

            let lines_2 = [
                item.updated_text,
                `Click to toggle between 12 and 24 hours`,
            ]

            item_updated.title = lines_2.join(`\n`)
        }
        else {
            item_status.title = `${item.updated_text}\n${status}`
            item_updated.classList.add(`hidden`)
        }

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
            else if (e.key === `Escape`) {
                Select.deselect_all()
                e.preventDefault()
            }
        })
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
        let container = this.get_outer()
        container.scrollTop -= this.scroll_step
    }

    static scroll_down() {
        let container = this.get_outer()
        container.scrollTop += this.scroll_step
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
}