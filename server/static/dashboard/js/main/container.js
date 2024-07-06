/*

This is the main container widget with the vertical items

*/

class Container {
    static check_scroll_debouncer_delay = 100
    static wrap_enabled = true
    static highlight_enabled = true
    static highlight_debouncer_delay = 50
    static ls_name_wrap = `wrap_enabled`
    static ls_name_highlight = `highlight_enabled`
    static selected_class = `selected`

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

        DOM.ev(container, `click`, (e) => {
            let item = e.target.closest(`.item`)

            if (!item) {
                return
            }

            let curl = this.extract_curl(item)

            if (e.target.closest(`.item_updated`)) {
                Dates.change_mode()
                return
            }

            if (e.target.closest(`.item_icon`)) {
                if (e.ctrlKey || e.shiftKey) {
                    this.toggle_select(item)
                    return
                }

                this.select_single(item)
                return
            }
        })

        DOM.ev(container, `auxclick`, (e) => {
            let item = e.target.closest(`.item`)

            if (!item) {
                return
            }

            let curl = this.extract_curl(item)

            if (e.button == 1) {
                if (e.target.closest(`.item_icon`)) {
                    Curlist.remove(curl)
                }
            }
        })

        DOM.ev(container, `contextmenu`, (e) => {
            let item = e.target.closest(`.item`)

            if (!item) {
                return
            }

            let curl = this.extract_curl(item)
            Items.show_menu({curl: curl, e: e, from: `container`})
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
        this.highlight_enabled = this.load_highlight_enabled()

        this.highlight_debouncer = Utils.create_debouncer((args) => {
            this.do_highlight(args)
        }, this.highlight_debouncer_delay)
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
                this.order_based_on_container()
            },
            locked: () => {
                return Sort.mode !== `order`
            },
            select: (item) => {
                this.select_item(item)
            },
        })
    }

    static order_based_on_container() {
        let items = this.get_items()
        let curls = items.map(item => item.dataset.curl)

        if (!curls || !curls.length) {
            return
        }

        Curls.save(curls)
        Curlist.update()
    }

    static save_wrap_enabled() {
        Utils.save(this.ls_name_wrap, this.wrap_enabled)
    }

    static load_wrap_enabled() {
        return Utils.load_boolean(this.ls_name_wrap)
    }

    static save_highlight_enabled() {
        Utils.save(this.ls_name_highlight, this.highlight_enabled)
    }

    static load_highlight_enabled() {
        return Utils.load_boolean(this.ls_name_highlight)
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

        if (args.select.length) {
            Curlist.select_items(args.select)
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
        ]

        if (Sort.mode === `order`) {
            lines.push(`Drag to reorder`)
        }

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
        for (let item of Items.list) {
            item.element.classList.remove(this.selected_class)
        }
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

        if (!this.highlight_enabled) {
            return
        }

        let selected = Curlist.get_selected_curls()

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
    }

    static deselect_item(item) {
        item.classList.remove(this.selected_class)
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
        this.select_item(item)
        Peek.show({curl: curl})
    }
}