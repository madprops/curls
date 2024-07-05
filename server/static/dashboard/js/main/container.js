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
    static ls_name_date_mode = `date_mode`
    static default_date_mode = `12`

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
            if (e.target.closest(`.item_updated`)) {
                this.change_date_mode()
                return
            }

            if (e.target.closest(`.item_icon`)) {
                let curl = e.target.closest(`.item`).dataset.curl
                Items.show_menu({curl: curl, e: e, from: `container`})
                return
            }
        })

        DOM.ev(container, `auxclick`, (e) => {
            if (e.button == 1) {
                if (e.target.closest(`.item_icon`)) {
                    let curl = e.target.closest(`.item`).dataset.curl
                    Curls.remove([curl])
                    return
                }
            }
        })

        DOM.ev(container, `contextmenu`, (e) => {
            if (e.target.closest(`.item_icon`)) {
                e.preventDefault()
                let curl = e.target.closest(`.item`).dataset.curl
                Items.show_menu({curl: curl, e: e, from: `container`})
            }
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

        DOM.ev(container, `dragstart`, (e) => {
            if (App.sort_mode !== `order`) {
                e.preventDefault()
                return false
            }

            if (!e.target.classList.contains(`item_icon`)) {
                e.preventDefault()
                return false
            }

            let item = e.target.closest(`.item`)
            let curl = item.dataset.curl
            App.drag_y_container = e.clientY

            e.dataTransfer.setData(`text`, curl)
            e.dataTransfer.setDragImage(new Image(), 0, 0)

            App.drag_items_container = [item]
        })

        DOM.ev(container, `dragenter`, (e) => {
            let items = this.get_items()
            let item = e.target.closest(`.item`)
            let index = items.indexOf(item)

            if (index === -1) {
                return
            }

            let direction = (e.clientY > App.drag_y_container) ? `down` : `up`
            App.drag_y_container = e.clientY

            if (direction === `up`) {
                item.before(...App.drag_items_container)
            }
            else if (direction === `down`) {
                item.after(...App.drag_items_container)
            }
        })

        DOM.ev(container, `dragend`, (e) => {
            this.order_based_on_container()
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
        Items.add_dates()
        this.update({select: curls})
    }

    static insert(items) {
        Items.list = items
        Items.list.map(x => x.missing = false)
        let missing = Items.find_missing()
        Items.list.push(...missing)
        Items.add_dates()
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

        item_icon.title = lines.join(`\n`)

        let canvas = DOM.create(`canvas`, `item_icon_canvas`)
        jdenticon.update(canvas, item.curl)
        item_icon.append(canvas)

        let item_curl = DOM.create(`div`, `item_curl`)
        let item_status = DOM.create(`div`, `item_status`)

        if (!this.wrap_enabled) {
            item_status.classList.add(`nowrap`)
        }

        let item_updated = DOM.create(`div`, `item_updated glow`)

        item_curl.textContent = item.curl
        item_curl.title = item.curl
        let status = item.status || `Not updated yet`
        item_status.innerHTML = Utils.sanitize(status)
        item_status.title = status
        Utils.urlize(item_status)

        item_updated.textContent = item.updated_text

        let lines_2 = [
            item.updated_text,
            `Click to toggle between 12 and 24 hours`,
        ]

        item_updated.title = lines_2.join(`\n`)

        el.append(item_icon)
        el.append(item_curl)
        el.append(item_status)
        el.append(item_updated)

        el.dataset.curl = item.curl

        container.append(el)
        container.append(el)

        item.element = el
    }

    static get_date_mode() {
        return Utils.load_string(this.ls_name_date_mode, this.default_date_mode)
    }

    static change_date_mode() {
        let selected = window.getSelection().toString()

        if (selected) {
            return
        }

        let date_mode = this.get_date_mode()
        date_mode = date_mode === `12` ? `24` : `12`
        Utils.save(this.ls_name_date_mode, date_mode)
        Items.add_dates()
        this.update()
    }

    static dehighlight() {
        for (let item of Items.list) {
            item.element.classList.remove(`highlight`)
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
                item.element.classList.add(`highlight`)
            }
            else {
                item.element.classList.remove(`highlight`)
            }
        }

        if (args.curl) {
            let item = Items.get(args.curl)

            if (item && item.element) {
                Utils.scroll_element({item: item.element, behavior: args.behavior})
            }
        }
    }
}