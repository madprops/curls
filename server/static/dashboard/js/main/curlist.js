/*

The curlist is the sidebar at the last
This is the list of curls of a specific color
Several features are implemented
Like navigation, selection, filtering

*/

class Curlist {
    static enabled = true
    static mouse_down = false
    static mouse_selected = false
    static filter_debouncer_delay = 250
    static ls_name = `curlist_enabled`
    static selected_id = 0
    static dragged = false

    static setup() {
        let container = DOM.el(`#curlist_container`)
        let curlist = DOM.el(`#curlist`)
        let curlist_top = DOM.el(`#curlist_top`)

        let lines = [
            `Add the curls you want to monitor here`,
            `Double Click empty space to add curls`,
            `Click on the header to show menu`,
            `Right Click empty space to show menu`,
            `Press Delete to remove selected curls`,
        ]

        container.title = lines.join(`\n`)

        DOM.evs(curlist_top, [`click`, `contextmenu`], (e) => {
            this.show_menu(e)
            e.preventDefault()
        })

        this.enabled = this.load_enabled()
        this.check_enabled()

        DOM.ev(container, `contextmenu`, (e) => {
            let item = this.extract_item(e.target)
            let curl = this.extract_curl(item)

            if (item) {
                Items.show_menu({curl: curl, e: e})
            }
            else {
                this.show_menu(e)
            }

            e.preventDefault()
        })

        DOM.ev(container, `dblclick`, (e) => {
            if (this.dragged) {
                return
            }

            if (e.ctrlKey || e.shiftKey) {
                return
            }

            let item = this.extract_item(e.target)
            if (!item) {
                Curls.add(`bottom`)
            }
        })

        DOM.ev(container, `keydown`, (e) => {
            if (e.key === `Delete`) {
                Curls.remove_selected()
                e.preventDefault()
            }
            else if (e.key === `ArrowUp`) {
                if (e.ctrlKey) {
                    e.preventDefault()
                    this.move_up()
                    return
                }

                this.select_vertical(`up`, e.shiftKey)
                e.preventDefault()
            }
            else if (e.key === `ArrowDown`) {
                if (e.ctrlKey) {
                    e.preventDefault()
                    this.move_down()
                    return
                }

                this.select_vertical(`down`, e.shiftKey)
                e.preventDefault()
            }
            else if (e.key === `c`) {
                if (e.ctrlKey) {
                    this.copy()
                    e.preventDefault()
                }
            }
            else if (e.key === `Escape`) {
                Peek.hide()
                this.deselect()
            }
        })

        DOM.ev(container, `mousedown`, (e) => {
            this.mousedown(e)
        })

        DOM.ev(container, `mouseup`, () => {
            this.mouseup()
        })

        DOM.ev(container, `mouseover`, (e) => {
            this.mouseover(e)
        })

        DOM.ev(curlist, `click`, (e) => {
            let item = this.extract_item(e.target)

            if (item) {
                let selected = this.get_selected_items()

                if (e.shiftKey && selected.length) {
                    this.select_range(item)
                }
                else if (e.ctrlKey && selected.length) {
                    this.select_toggle(item)
                }
                else {
                    this.select_item(item)
                }
            }
        })

        DOM.ev(curlist, `dblclick`, (e) => {
            if (this.dragged) {
                return
            }

            if (e.ctrlKey || e.shiftKey) {
                return
            }

            let item = this.extract_item(e.target)
            let curl = this.extract_curl(item)

            if (item) {
                Curls.edit(curl)
            }
        })

        DOM.ev(curlist, `auxclick`, (e) => {
            if (e.button === 1) {
                let item = this.extract_item(e.target)
                let curl = this.extract_curl(item)
                Curlist.remove(curl)
            }
        })

        let filter = DOM.el(`#curlist_filter`)

        DOM.ev(filter, `keydown`, (e) => {
            if (e.key === `Escape`) {
                this.clear_filter()
                Peek.hide()
            }
            else if (e.key === `ArrowUp`) {
                this.select_vertical(`up`, e.shiftKey)
                e.preventDefault()
            }
            else if (e.key === `ArrowDown`) {
                this.select_vertical(`down`, e.shiftKey)
                e.preventDefault()
            }
            else {
                this.filter()
            }
        })

        this.filter_debouncer = Utils.create_debouncer(() => {
            this.do_filter()
        }, this.filter_debouncer_delay)

        filter.value = ``

        Block.register(`curlist_vertical`, 200)
        this.drag_events()
        this.update()
    }

    static update(curls) {
        let curlist = DOM.el(`#curlist`)
        curlist.innerHTML = ``

        if (!curls) {
            curls = Curls.get()
        }

        for (let curl of curls) {
            let item = DOM.create(`div`)
            item.classList.add(`curlist_item`)
            item.draggable = true
            item.dataset.curl = curl

            let lines = [
                `Click to peek`,
                `Right Click to show menu`,
                `Double Click to edit`,
                `Middle Click to remove`,
            ]

            item.title = lines.join(`\n`)
            let curl_ = DOM.create(`div`, `curlist_item_curl`)
            curl_.textContent = curl
            item.append(curl_)

            curlist.append(item)
        }

        this.update_top()
        this.blank_filter()
        DOM.el(`#curlist_container`).scrollTop = 0
        App.update_autocomplete()
    }

    static update_top() {
        let curlist_top = DOM.el(`#curlist_top`)
        let curls = Curls.get()
        curlist_top.textContent = `Curls (${curls.length})`
    }

    static copy() {
        let curls = Curls.get()
        let text = curls.join(` `)
        Utils.copy_to_clipboard(text)
    }

    static show_menu(e) {
        let curls = Curls.get()
        let items

        let data = [
            {
                separator: true,
            },
            {
                text: `Export`,
                action: () => {
                    this.export()
                }
            },
            {
                text: `Import`,
                action: () => {
                    this.import()
                }
            },
            {
                text: `Clear`,
                action: () => {
                    Curls.clear_all()
                }
            },
        ]

        if (curls.length) {
            items = [
                {
                    text: `Add (Top)`,
                    action: () => {
                        Curls.add(`top`)
                    }
                },
                {
                    text: `Add (Bottom)`,
                    action: () => {
                        Curls.add(`bottom`)
                    }
                },
                {
                    separator: true,
                },
                {
                    text: `Sort (Asc)`,
                    action: () => {
                        this.sort(`asc`)
                    }
                },
                {
                    text: `Sort (Desc)`,
                    action: () => {
                        this.sort(`desc`)
                    }
                },
                {
                    separator: true,
                },
                {
                    text: `Copy`,
                    action: () => {
                        this.copy()
                    }
                },
                {
                    text: `Replace`,
                    action: () => {
                        Curls.replace()
                    }
                },
                {
                    text: `Remove`,
                    action: (e) => {
                        Curls.show_remove_menu(e)
                    }
                },
                ...data,
            ]
        }
        else {
            items = [
                {
                    text: `Add`,
                    action: () => {
                        Curls.add(`top`)
                    }
                },
                ...data,
            ]
        }

        NeedContext.show({
            items: items, e: e, after_hide: () => {
                this.focus()
            }
        })
    }

    static load_enabled() {
        return Utils.load_boolean(this.ls_name)
    }

    static check_enabled() {
        if (this.enabled) {
            this.show()
        }
        else {
            this.hide()
        }
    }

    static show() {
        DOM.show(`#left_side`)
        this.enabled = true
    }

    static hide() {
        DOM.hide(`#left_side`)
        this.enabled = false
    }

    static toggle() {
        if (this.enabled) {
            this.hide()
        }
        else {
            this.show()
        }

        Utils.save(this.ls_name, this.enabled)
    }

    static sort(how) {
        let w = how === `asc` ? `Ascending` : `Descending`

        Windows.confirm({title: `Sort Curls`, ok: () => {
            this.do_sort(how)
        }, message: `${w} Order`})
    }

    static do_sort(how) {
        let curls = Curls.get()

        if (how === `asc`) {
            curls.sort()
        }
        else if (how === `desc`) {
            curls.sort().reverse()
        }

        Curls.save(curls)
        this.update()
        Sort.sort_if_order()
    }

    static export() {
        let curlists = {}

        for (let color in Colors.colors) {
            let curlist = Curls.get(color)

            if (!curlist.length) {
                continue
            }

            curlists[color] = curlist
        }

        if (!Object.keys(curlists).length) {
            Windows.alert({message: `No curls to export`})
            return
        }

        Windows.alert_export(curlists)
    }

    static import() {
        Windows.prompt({title: `Paste Data`, callback: (value) => {
            this.import_submit(value)
        }, message: `You get this data in Export`})
    }

    static import_submit(data) {
        if (!data) {
            return
        }

        try {
            let curlists = JSON.parse(data)
            let modified = false

            for (let color in curlists) {
                let curlist = curlists[color]

                if (!curlist) {
                    continue
                }

                Curls.save(curlist, color)
                modified = true
            }

            if (!modified) {
                Windows.alert({message: `No curls to import`})
                return
            }

            this.update()
            Update.update()
        }
        catch (err) {
            Utils.error(err)
            Windows.alert({title: `Error`, message: err})
        }
    }

    static drag_events() {
        let container = DOM.el(`#curlist`)

        DOM.ev(container, `dragstart`, (e) => {
            let item = this.extract_item(e.target)
            let curl = this.extract_curl(item)
            this.drag_y = e.clientY

            e.dataTransfer.setData(`text`, curl)
            e.dataTransfer.setDragImage(new Image(), 0, 0)

            let selected = this.get_selected_items()

            if (selected.length && selected.includes(item)) {
                this.drag_items = selected
            }
            else {
                this.select_item(item)
                this.drag_items = [item]
            }
        })

        DOM.ev(container, `dragenter`, (e) => {
            let items = this.get_elements()
            let item = this.extract_item(e.target)
            let index = items.indexOf(item)

            if (index === -1) {
                return
            }

            let direction = (e.clientY > this.drag_y) ? `down` : `up`
            this.drag_y = e.clientY

            if (direction === `up`) {
                item.before(...this.drag_items)
            }
            else if (direction === `down`) {
                item.after(...this.drag_items)
            }
        })

        DOM.ev(container, `dragend`, (e) => {
            this.save_after_move()
        })

        let filter = DOM.el(`#curlist_filter`)

        DOM.ev(filter, `drop`, (e) => {
            e.preventDefault()
        })
    }

    static get_curls() {
        let elements = this.get_elements()
        let curls = []

        for (let el of elements) {
            curls.push(el.dataset.curl)
        }

        return curls
    }

    static select_item(item) {
        let items = this.get_elements()

        for (let it of items) {
            this.do_deselect_item(it)
        }

        this.do_select_item({item: item})
    }

    static do_select_item(args = {}) {
        let def_args = {
            block: `nearest`,
            peek: true,
            highlight: true,
            highlight_behavior: `smooth`,
        }

        Utils.def_args(def_args, args)
        args.item.classList.add(`selected`)

        if (args.block !== `none`) {
            Utils.scroll_element({item: args.item, block: args.block})
        }

        if (args.peek) {
            let curl = this.extract_curl(args.item)
            Peek.show({curl: curl})
        }

        if (args.highlight) {
            let curl = this.extract_curl(args.item)
            Container.highlight({curl: curl, behavior: args.highlight_behavior})
        }

        this.selected_id += 1
        args.item.dataset.selected_id = this.selected_id
    }

    static do_deselect_item(item) {
        item.classList.remove(`selected`)
        item.dataset.selected_id = 0
    }

    static select_range(item) {
        let selected = this.get_selected_items()

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
                    this.do_deselect_item(items[i])
                }

                continue
            }

            if (i > end) {
                if (direction === `down`) {
                    this.do_deselect_item(items[i])
                }

                continue
            }

            select.push(items[i])
        }

        if (direction === `up`) {
            select.reverse()
        }

        for (let item_ of select) {
            let peek = item_ === item
            this.do_select_item({item: item_, peek: peek, highlight: false})
        }

        let curl = this.extract_curl(item)
        Container.highlight({curl: curl})
    }

    static select_toggle(item) {
        if (item.classList.contains(`selected`)) {
            this.do_deselect_item(item)
        }
        else {
            this.do_select_item({item: item})
        }
    }

    static get_selected_curls() {
        let items = this.get_elements()
        let selected_items = items.filter(x => x.classList.contains(`selected`))
        let curls = []

        for (let item of selected_items) {
            curls.push(item.dataset.curl)
        }

        return curls
    }

    static get_selected_items() {
        let items = this.get_elements()
        return items.filter(x => x.classList.contains(`selected`))
    }

    static deselect() {
        let items = this.get_elements()

        for (let item of items) {
            this.do_deselect_item(item)
        }

        Container.dehighlight()
        this.selected_id = 0
    }

    static get_elements() {
        return DOM.els(`#curlist .curlist_item`)
    }

    static get_item(curl) {
        let items = this.get_elements()
        return items.find(x => x.dataset.curl === curl)
    }

    static select_vertical(direction, shift) {
        if (Block.charge(`curlist_vertical`)) {
            return
        }

        let items = this.get_visible()

        if (!items.length) {
            return
        }

        let selected = this.get_selected_items()
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

            this.select_item(item)
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

                this.select_item(item)
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

                this.select_item(item)
            }
        }
    }

    static focus() {
        DOM.el(`#curlist`).focus()
    }

    static get_visible() {
        let els = this.get_elements()
        return els.filter(x => !x.classList.contains(`hidden`))
    }

    static get_filter_value() {
        return DOM.el(`#curlist_filter`).value.toLowerCase().trim()
    }

    static filter() {
        this.filter_debouncer.call()
    }

    static do_filter() {
        this.filter_debouncer.cancel()
        let els = this.get_elements()
        let value = this.get_filter_value()

        let hide = (el) => {
            DOM.hide(el)
        }

        let show = (el) => {
            DOM.show(el)
        }

        for (let el of els) {
            let curl = el.dataset.curl

            if (curl.includes(value)) {
                show(el)
            }
            else {
                hide(el)
            }
        }
    }

    static blank_filter() {
        DOM.el(`#curlist_filter`).value = ``
    }

    static clear_filter() {
        this.blank_filter()
        let els = this.get_elements()

        if (!els.length) {
            return
        }

        for (let el of els) {
            DOM.show(el)
        }

        this.deselect()
    }

    static extract_item(item) {
        return item.closest(`.curlist_item`)
    }

    static extract_curl(item) {
        if (item) {
            return item.dataset.curl
        }
        else {
            return ``
        }
    }

    static focus_item(curl) {
        let item = this.get_item(curl)

        if (item) {
            this.do_select_item({item: item})
        }
    }

    static move_up() {
        let items = this.get_elements()
        let selected = this.get_selected_items()
        let first_index = items.indexOf(selected[0])

        if (first_index === 0) {
            return
        }

        if (first_index === 0) {
            return
        }

        let prev = items[first_index - 1]
        prev.before(...selected)
        Utils.scroll_element({item: selected[0]})
        this.save_after_move()
    }

    static move_down() {
        let items = this.get_elements()
        let selected = this.get_selected_items()
        let last_index = items.indexOf(Utils.last(selected))

        if (last_index === items.length - 1) {
            return
        }

        if (last_index === items.length - 1) {
            return
        }

        let next = items[last_index + 1]
        next.after(...selected)
        Utils.scroll_element({item: Utils.last(selected)})
        this.save_after_move()
    }

    static save_after_move() {
        let curls = this.get_curls()
        Curls.save(curls)
        Sort.sort_if_order()
    }

    static select_items(curls) {
        let items = this.get_visible()
        this.deselect()

        for (let curl of curls) {
            let item = this.get_item(curl)
            let index = items.indexOf(item)
            let peek = false

            if ((index === 0) || (index === items.length - 1)) {
                peek = true
            }

            if (item) {
                this.do_select_item({item: item, peek: peek})
            }
        }
    }

    static mousedown(e) {
        this.dragged = false
        let item = this.extract_item(e.target)

        if (item) {
            return
        }

        this.mouse_down = true
        this.mouse_selected = false
    }

    static mouseup() {
        this.mouse_down = false
        this.mouse_selected = false
    }

    static mouseover(e) {
        if (!this.mouse_down) {
            return
        }

        this.dragged = true

        if (!e.target.closest(`.curlist_item`)) {
            return
        }

        if (!this.mouse_selected) {
            this.deselect()
        }

        let item = this.extract_item(e.target)
        this.do_select_item({item: item})
        this.mouse_selected = true
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

    static remove(curl) {
        let selected = this.get_selected_items()
        let item = this.get_item(curl)

        if (item) {
            if (selected.length && selected.includes(item)) {
                Curls.remove_selected()
            }
            else {
                this.select_item(item)
                Curls.remove([curl])
            }
        }
    }
}