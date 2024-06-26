const App = {}

App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.HOUR = App.MINUTE * 60
App.DAY = App.HOUR * 24
App.WEEK = App.DAY * 7
App.MONTH = App.DAY * 30
App.YEAR = App.DAY * 365

App.update_delay = App.MINUTE * 5
App.updates_enabled = false
App.max_curls = 100
App.curl_max_length = 20
App.key_length = 20
App.status_max_length = 500
App.curlist_enabled = true
App.console_logs = true
App.items = []
App.clear_delay = 800
App.max_picker_items = 100
App.max_status_list = 25
App.filter_debouncer_delay = 250
App.update_debouncer_delay = 250
App.change_debouncer_delay = 250
App.changing = false
App.updating = false
App.network = `🛜`
App.date_mode = `12`

App.curl_too_long = `Curl is too long`
App.key_too_long = `Key is too long`
App.status_too_long = `Status is too long`

App.colors = {
    red: `rgb(255, 89, 89)`,
    green: `rgb(87, 255, 87)`,
    blue: `rgb(118, 120, 255)`,
    yellow: `rgb(255, 219, 78)`,
    purple: `rgb(193, 56, 255)`,
    white: `rgb(255, 255, 255)`,
}

App.update_modes = [
    `disabled`,
    `minutes_1`,
    `minutes_5`,
    `minutes_10`,
    `minutes_30`,
    `minutes_60`,
]

App.empty_info = [
    `Add some curls to the list on the left.`,
    `These will be monitored for status changes.`,
    `Above you can change the status of your own curls.`,
    `Use the claim link on the top right to get a new curl.`,
    `Each color has their own set of curls.`,
].join(`<br>`)

App.setup = () => {
    App.setup_buttons()
    App.setup_color()
    App.setup_curlist()
    App.setup_container()
    App.setup_updater()
    App.setup_sort()
    App.setup_change()
    App.setup_picker()
    App.clean_curlist()
    App.setup_status()
    App.setup_filter()
    App.update(true)
}

App.setup_buttons = () => {
    let update = DOM.el(`#update`)

    DOM.ev(update, `click`, () => {
        App.update(true)
    })

    let toggle_curlist = DOM.el(`#toggle_curlist`)

    DOM.ev(toggle_curlist, `click`, () => {
        App.toggle_curlist()
    })
}

App.update_title = () => {
    let color = App.capitalize(App.get_color())
    document.title = `Curls - ${color}`
}

App.get_used_curls = () => {
    let curls = App.get_curls()

    if (!curls.length) {
        return []
    }

    let used_curls = []

    for (let curl of curls) {
        if (used_curls.length > App.max_curls) {
            break
        }

        curl = curl.trim()

        if (!curl) {
            continue
        }

        if (curl.includes(` `)) {
            continue
        }

        if (curl.length > App.curl_max_length) {
            continue
        }

        if (used_curls.includes(curl)) {
            continue
        }

        used_curls.push(curl)
    }

    return used_curls
}

App.get_curls = () => {
    let curlist = DOM.el(`#curlist`).value
    let lines = curlist.split(`\n`).filter(x => x !== ``)
    return lines
}

App.do_add_curl = (where, curl = ``, update = true) => {
    if (!curl) {
        curl = prompt(`Add a curl:`)

        if (!curl) {
            return
        }
    }

    let curlist = DOM.el(`#curlist`)

    if (where === `top`) {
        curlist.value = `${curl}\n${curlist.value}`
    }
    else if (where === `bottom`) {
        curlist.value += `\n${curl}`
    }

    App.clean_curlist()

    if (App.save_curlist()) {
        if (update) {
            App.update(true)
        }
    }
}

App.save_cleaned = (cleaned, removed) => {
    let s = App.plural(removed.length, `item`, `items`)

    if (confirm(`Remove ${removed.length} ${s}?`)) {
        curlist.value = cleaned.join(`\n`)
        App.clean_curlist()
        App.save_curlist()
        App.remove_items(removed)
    }
}

App.add_owned_curl = (curl) => {
    let curls = App.get_curls()

    if (!curls.includes(curl)) {
        App.do_add_curl(`top`, curl)
    }
}

App.copy_item = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    let status = item.querySelector(`.item_status`).textContent
    let updated = item.querySelector(`.item_updated`).textContent
    let msg = `${curl}\n${status}\n${updated}`
    navigator.clipboard.writeText(msg)

    let icon = item.querySelector(`.item_icon`)
    icon.classList.add(`blink`)

    setTimeout(() => {
        icon.classList.remove(`blink`)
    }, 1000)
}

App.curl_to_top = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`top`, curl, false)
    App.sort_if_order()
}

App.curl_to_bottom = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl, false)
    App.do_add_curl(`bottom`, curl, false)
    App.sort_if_order()
}

App.get_date_mode = () => {
    return localStorage.getItem(`date_mode`) || `12`
}

App.insert_items = (items) => {
    App.items = items
    App.items.map(x => x.missing = false)
    let missing = App.get_missing()
    App.items.push(...missing)
    App.refresh_items()
}

App.refresh_items = () => {
    App.clear_container()
    App.sort_items(App.items)

    for (let item of App.items) {
        App.insert_item(item)
    }

    App.unselect()
    App.check_empty()
    App.check_filter()
}

App.insert_item = (item) => {
    let container = DOM.el(`#container`)
    let el = DOM.create(`div`, `item`)
    let item_icon = DOM.create(`div`, `item_icon`)
    item_icon.title = `Click to show a menu`

    let canvas = DOM.create(`canvas`, `item_icon_canvas`)
    jdenticon.update(canvas, item.curl)
    item_icon.append(canvas)

    let item_curl = DOM.create(`div`, `item_curl`)
    let item_status = DOM.create(`div`, `item_status`)
    let item_updated = DOM.create(`div`, `item_updated`)

    item_curl.textContent = item.curl
    item_curl.title = item.curl
    let status = item.status || `Not updated yet`
    item_status.innerHTML = App.sanitize(status)
    App.urlize(item_status)

    let date = new Date(item.updated + "Z")
    let date_mode = App.get_date_mode()
    let s_date

    if (date_mode === `12`) {
        s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
    }
    else if (date_mode === `24`) {
        s_date = dateFormat(date, `dd/mmm/yy - HH:MM`)
    }

    item_updated.textContent = s_date
    item_updated.title = `Click to toggle between 12 and 24 hour formats`

    el.append(item_icon)
    el.append(item_curl)
    el.append(item_status)
    el.append(item_updated)

    el.dataset.curl = item.curl

    container.append(el)
    container.append(el)

    item.element = el
}

App.get_item = (curl) => {
    return App.items.find(item => item.curl === curl)
}

App.show_item_menu = (e) => {
    let items = [
        {
            text: `Copy`,
            action: () => {
                App.copy_item(e)
            }
        },
        {
            text: `Move`,
            action: () => {
                App.move_to_color(e)
            }
        },
        {
            text: `Remove`,
            action: () => {
                App.remove_curl(e)
            }
        },
        {
            text: `To Top`,
            action: () => {
                App.curl_to_top(e)
            }
        },
        {
            text: `To Bottom`,
            action: () => {
                App.curl_to_bottom(e)
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.item_to_top = (curl) => {
    let el = App.get_item(curl).element

    if (el) {
        let container = DOM.el(`#container`)
        container.prepend(el)
    }
}

App.item_to_bottom = (curl) => {
    let el = App.get_item(curl).element

    if (el) {
        let container = DOM.el(`#container`)
        container.append(el)
    }
}

App.get_missing = () => {
    let used = App.get_used_curls()
    let curls = used.filter(curl => !App.items.find(item => item.curl === curl))
    let missing = []

    for (let curl of curls) {
        missing.push({curl: curl, status: `Not found`, updated: `0`, missing: true})
    }

    return missing
}

App.get_missing_items = () => {
    return App.items.filter(item => item.missing)
}

App.change_date_mode = () => {
    let date_mode = App.get_date_mode()
    date_mode = date_mode === `12` ? `24` : `12`
    localStorage.setItem(`date_mode`, date_mode)
    App.refresh_items()
}

App.get_owned_items = () => {
    let picker_items = App.get_picker_items()

    return App.items.filter(item => picker_items.find(
        picker => picker.curl === item.curl))
}

App.get_items_by_date = (what) => {
    let cleaned = []
    let now = App.now()

    for (let item of App.items) {
        let date = new Date(item.updated + "Z")
        let diff = now - date

        if (diff < what) {
            cleaned.push(item)
        }
    }

    return cleaned
}

App.get_today_items = () => {
    return App.get_items_by_date(App.DAY)
}

App.get_week_items = () => {
    return App.get_items_by_date(App.WEEK)
}

App.get_month_items = () => {
    return App.get_items_by_date(App.MONTH)
}

App.reset_items = () => {
    App.items = []
}

App.setup_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)

    DOM.ev(curlist, `focusout`, () => {
        App.clean_curlist()

        if (App.save_curlist()) {
            App.update(true)
        }
    })

    DOM.ev(curlist_top, `click`, (e) => {
        App.show_curlist_menu(e)
    })

    DOM.ev(curlist_top, `contextmenu`, (e) => {
        App.show_curlist_menu(e)
    })

    let enabled = localStorage.getItem(`curlist_enabled`) || `true`

    if (enabled === `true`) {
        App.show_curlist()
    }
    else {
        App.hide_curlist()
    }

    App.load_curlist()
}

App.get_curlist = () => {
    return DOM.el(`#curlist`).value
}

App.clean_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let curlist_top = DOM.el(`#curlist_top`)
    let curls = App.get_curls()
    let words = []

    for (let curl of curls) {
        let parts = curl.split(` `)
        words.push(...parts)
    }

    words = words.map(x => x.replace(/[^a-zA-Z0-9]/g, ``))
    let cleaned = []

    for (let curl of words) {
        curl = curl.toLowerCase().trim()

        if (!curl) {
            continue
        }

        if (curl.length > App.curl_max_length) {
            continue
        }

        if (cleaned.includes(curl)) {
            continue
        }

        cleaned.push(curl)

        if (cleaned.length >= App.max_curls) {
            break
        }
    }

    curlist.value = cleaned.join(`\n`)
    curlist_top.textContent = `Curls (${cleaned.length})`
}

App.save_curlist = () => {
    let curlist = DOM.el(`#curlist`).value
    let color = App.get_color()
    let name = `curlist_${color}`

    if (curlist === localStorage.getItem(name)) {
        return false
    }

    localStorage.setItem(name, curlist)
    return true
}

App.load_curlist = () => {
    let curlist = DOM.el(`#curlist`)
    let color = App.get_color()
    let name = `curlist_${color}`
    let saved = localStorage.getItem(name) || ``
    curlist.value = saved
}

App.copy_curlist = (e) => {
    let curlist = DOM.el(`#curlist`)
    navigator.clipboard.writeText(curlist.value)
}

App.show_curlist_menu = (e) => {
    let curls = App.get_curls()
    let items

    if (curls.length) {
        items = [
            {
                text: `Copy`,
                action: () => {
                    App.copy_curlist(e)
                }
            },
            {
                separator: true,
            },
            {
                text: `Add (Top)`,
                action: () => {
                    App.do_add_curl(`top`)
            },
            },
            {
                text: `Add (Bottom)`,
                action: () => {
                    App.do_add_curl(`bottom`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Sort (Ascending)`,
                action: () => {
                    App.sort_curlist(`asc`)
                }
            },
            {
                text: `Sort (Descending)`,
                action: () => {
                    App.sort_curlist(`desc`)
                }
            },
            {
                separator: true,
            },
            {
                text: `Remove`,
                action: () => {
                    App.remove_a_curl()
                }
            },
            {
                text: `Remove Not Found`,
                action: () => {
                    App.remove_not_found()
                }
            },
            {
                text: `Remove Empty`,
                action: () => {
                    App.remove_empty()
                }
            },
            {
                text: `Remove Old`,
                action: () => {
                    App.remove_old()
                }
            },
        ]
    }
    else {
        items = [
            {
                text: `Add`,
                action: () => {
                    App.do_add_curl(`top`)
                }
            },
        ]
    }

    NeedContext.show({items: items, e: e})
}

App.show_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    left_side.classList.remove(`hidden`)
    App.curlist_enabled = true
}

App.hide_curlist = () => {
    let left_side = DOM.el(`#left_side`)
    left_side.classList.add(`hidden`)
    App.curlist_enabled = false
}

App.toggle_curlist = () => {
    if (App.curlist_enabled) {
        App.hide_curlist()
    }
    else {
        App.show_curlist()
    }

    localStorage.setItem(`curlist_enabled`, App.curlist_enabled)
}

App.sort_curlist = (how) => {
    let w = how === `asc` ? `Ascending` : `Descending`

    if (confirm(`Sort the curls (${w})?`)) {
        App.do_sort_curlist(how)
    }
}

App.do_sort_curlist = (how) => {
    let curlist = App.get_curlist()
    let lines = curlist.split(`\n`).filter(x => x !== ``)

    if (how === `asc`) {
        lines.sort()
    }
    else if (how === `desc`) {
        lines.sort().reverse()
    }

    DOM.el(`#curlist`).value = lines.join(`\n`)
    App.clean_curlist()
    App.save_curlist()
    App.sort_if_order()
}

App.setup_change = () => {
    let submit = DOM.el(`#change_submit`)

    DOM.ev(submit, `click`, () => {
        App.change()
    })

    App.change_debouncer = App.create_debouncer((force, feedback) => {
        App.do_change(force, feedback)
    }, App.change_debouncer_delay)
}

App.change = () => {
    App.change_debouncer.call()
}

App.do_change = () => {
    App.info(`Change: Trigger`)

    if (App.changing) {
        App.error(`Slow down`)
        return
    }

    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let status = DOM.el(`#change_status`).value.trim()

    if (!curl || !key || !status) {
        return
    }

    if (curl.length > App.curl_max_length) {
        App.error(App.curl_too_long)
        alert(App.curl_too_long)
        return
    }

    if (key.length > App.key_length) {
        App.error(App.key_too_long)
        alert(App.key_too_long)
        return
    }

    if (status.length > App.status_max_length) {
        App.error(App.status_too_long)
        alert(App.status_too_long)
        return
    }

    let url = `/change`
    let params = new URLSearchParams()

    params.append(`curl`, curl)
    params.append(`key`, key)
    params.append(`status`, status)

    App.show_changing()
    App.save_status(status)
    App.changing = true
    App.info(`Change: Request ${App.network}`)

    fetch(url, {
        method: `POST`,
        headers: {
            "Content-Type": `application/x-www-form-urlencoded`
        },
        body: params,
    })
    .then(response => response.text())
    .then(ans => {
        App.info(`Response: ${ans}`)
        App.clear_changing()

        if (ans === `ok`) {
            App.clear_status()
            App.update(true, false)
            App.add_owned_curl(curl)
            App.add_to_picker()
        }
        else {
            alert(ans)
        }
    })
    .catch(e => {
        App.error(`Failed to change`)
        App.clear_changing()
    })
}

App.clear_status = () => {
    DOM.el(`#change_status`).value = ``
}

App.show_changing = () => {
    let button = DOM.el(`#change_submit`)
    clearTimeout(App.clear_changing_timeout)
    button.classList.add(`active`)
}

App.clear_changing = () => {
    App.changing = false

    App.clear_changing_timeout = setTimeout(() => {
        let button = DOM.el(`#change_submit`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.setup_color = () => {
    let color = DOM.el(`#color`)
    color.value = App.load_color()

    DOM.ev(color, `change`, (e) => {
        App.change_color(e)
    })

    App.apply_color()
}

App.change_color = (e) => {
    let color = e.target.value
    localStorage.setItem(`color`, color)
    App.apply_color()
    App.load_curlist()
    App.reset_items()
    App.update(true)
}

App.load_color = () => {
    return localStorage.getItem(`color`) || `green`
}

App.get_color = () => {
    return DOM.el(`#color`).value
}

App.apply_color = () => {
    let rgb = App.colors[App.get_color()]
    document.documentElement.style.setProperty(`--color`, rgb)
    App.update_title()
}

App.move_to_color = (e) => {
    let current = App.get_color()
    let items = []

    function add (value, name) {
        if (current !== value) {
            items.push({
                text: name,
                action: () => {
                    App.do_move_to_color(value, e)
                }
            })
        }
    }

    add(`red`, `Red`)
    add(`green`, `Green`)
    add(`blue`, `Blue`)
    add(`yellow`, `Yellow`)
    add(`purple`, `Purple`)
    add(`white`, `White`)

    NeedContext.show({items: items, e: e})
}

App.do_move_to_color = (color, e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent
    App.do_remove_curl(curl)
    let curlist = App.get_color_curlist(color)
    curlist += `\n${curl}`
    localStorage.setItem(`curlist_${color}`, curlist)
}

App.get_color_curlist = (color) => {
    return localStorage.getItem(`curlist_${color}`) || ``
}

App.remove_a_curl = () => {
    let curl = prompt(`Remove a curl:`)

    if (!curl) {
        return
    }

    App.do_remove_curl(curl)
}

App.remove_not_found = () => {
    let missing = App.get_missing_items().map(x => x.curl)
    let curls = App.get_curls()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        if (!missing.includes(curl)) {
            cleaned.push(curl)
        }
        else {
            removed.push(curl)
        }
    }

    if (!removed.length) {
        return
    }

    App.save_cleaned(cleaned, removed)
}

App.remove_empty = () => {
    let curls = App.get_curls()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = App.get_item(curl)

        if (!item) {
            continue
        }

        if (!item.status) {
            removed.push(curl)
            continue
        }

        cleaned.push(curl)
    }

    if (!removed.length) {
        return
    }

    App.save_cleaned(cleaned, removed)
}

App.remove_old = () => {
    let curls = App.get_curls()
    let now = Date.now()
    let cleaned = []
    let removed = []

    for (let curl of curls) {
        let item = App.get_item(curl)

        if (!item) {
            continue
        }

        let date = item.updated

        if (date) {
            let datetime = new Date(date + "Z").getTime()

            if ((now - datetime) > (App.YEAR * 1)) {
                removed.push(curl)
                continue
            }
        }

        cleaned.push(curl)
    }

    if (!removed.length) {
        return
    }

    App.save_cleaned(cleaned, removed)
}

App.remove_curl = (e) => {
    let item = e.target.closest(`.item`)
    let curl = item.querySelector(`.item_curl`).textContent

    if (confirm(`Remove ${curl}?`)) {
        App.do_remove_curl(curl)
    }
}

App.do_remove_curl = (curl, remove_item = true) => {
    let curls = App.get_curls()
    let cleaned = []

    for (let curl_ of curls) {
        if (curl !== curl_) {
            cleaned.push(curl_)
        }
    }

    curlist.value = cleaned.join(`\n`)
    App.save_curlist()

    if (remove_item) {
        App.remove_item(curl)
    }
}

App.remove_item = (curl) => {
    App.remove_items([curl])
}

App.remove_items = (removed) => {
    for (let curl of removed) {
        let item = App.get_item(curl)
        let el = item.element

        if (el) {
            el.remove()
        }

        let index = App.items.indexOf(item)
        App.items.splice(index, 1)
    }

    App.check_empty()
}

App.setup_picker = () => {
    let picker = DOM.el(`#picker`)

    DOM.ev(picker, `click`, (e) => {
        App.show_picker(e)
    })

    let items = App.get_picker_items()

    if (items.length) {
        let first = items[0]
        DOM.el(`#change_curl`).value = first.curl
        DOM.el(`#change_key`).value = first.key
    }
}

App.get_picker_items = () => {
    let saved = localStorage.getItem(`picker`) || `[]`
    return JSON.parse(saved)
}

App.add_to_picker = () => {
    let curl = DOM.el(`#change_curl`).value.toLowerCase()
    let key = DOM.el(`#change_key`).value
    let cleaned = [{curl, key}]

    for (let item of App.get_picker_items()) {
        if (item.curl === curl) {
            continue
        }

        cleaned.push(item)

        if (cleaned.length >= App.max_picker_items) {
            break
        }
    }

    localStorage.setItem(`picker`, JSON.stringify(cleaned))
}

App.show_picker = (e) => {
    let items = []
    let picker_items = App.get_picker_items()

    if (!picker_items.length) {
        items.push({
            text: `Empty`,
            action: () => {}
        })
    }

    for (let item of picker_items) {
        items.push({
            text: item.curl,
            action: () => {
                DOM.el(`#change_curl`).value = item.curl
                DOM.el(`#change_key`).value = item.key
                App.add_to_picker()
            }
        })
    }

    NeedContext.show({items: items, e: e})
}

App.unselect = () => {
    window.getSelection().removeAllRanges()
}

App.plural = (n, singular, plural) => {
    if (n === 1) {
        return singular
    }
    else {
        return plural
    }
}

App.info = (msg) => {
    if (App.console_logs) {
        console.info(`💡 ${msg}`)
    }
}

App.error = (msg) => {
    if (App.console_logs) {
        console.info(`❌ ${msg}`)
    }
}

App.sanitize = (s) => {
    return s.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
}

App.urlize = (el) => {
    let html = el.innerHTML
    let urlRegex = /(https?:\/\/[^\s]+)/g
    let replacedText = html.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`)
    el.innerHTML = replacedText
}

App.get_url = (curl) => {
    return `/${curl}`
}

App.create_debouncer = (func, delay) => {
    if (typeof func !== `function`) {
        App.error(`Invalid debouncer function`)
        return
    }

    if (!delay) {
        App.error(`Invalid debouncer delay`)
        return
    }

    let timer
    let obj = {}

    function clear() {
        clearTimeout(timer)
    }

    function run(...args) {
        func(...args)
    }

    obj.call = (...args) => {
        clear()

        timer = setTimeout(() => {
            run(...args)
        }, delay)
    }

    obj.now = (...args) => {
        clear()
        run(...args)
    }

    obj.cancel = () => {
        clear()
    }

    return obj
}

App.switch_state = (current, list, reverse = false) => {
    let index = list.indexOf(current);

    if (index === -1) {
        throw new Error(`Invalid state: ${current}`);
    }

    if (reverse) {
        return list[(index - 1 + list.length) % list.length];
    } else {
        return list[(index + 1) % list.length] || list[1];
    }
}

App.wheel_direction = (e) => {
    if (e.deltaY > 0) {
        return `down`
    }
    else {
        return `up`
    }
}

App.capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

App.now = () => {
    return Date.now()
}

App.setup_container = () => {
    let container = DOM.el(`#container`)

    DOM.ev(container, `click`, (e) => {
        if (e.target.closest(`.item_updated`)) {
            App.change_date_mode()
            return
        }

        if (e.target.closest(`.item_icon`)) {
            App.show_item_menu(e)
            return
        }
    })

    DOM.ev(container, `contextmenu`, (e) => {
        if (e.target.closest(`.item_icon`)) {
            e.preventDefault()
            App.show_item_menu(e)
        }
    })
}

App.clear_container = () => {
    let container = DOM.el(`#container`)
    container.innerHTML = ``
}

App.empty_container = () => {
    App.set_container_info(App.empty_info)
}

App.check_empty = () => {
    let els = DOM.el(`#container .item`)

    if (els) {
        App.container_not_empty()
    }
    else {
        App.empty_container()
    }
}

App.check_visible = () => {
    let els = DOM.els(`#container .item`)

    for (let el of els) {7
        if (el.classList.contains(`hidden`)) {
            continue
        }

        App.container_not_empty()
        return
    }

    App.container_is_empty()
}

App.container_is_empty = () => {
    let container = DOM.el(`#container`)
    container.classList.add(`empty`)
}

App.container_not_empty = () => {
    let container = DOM.el(`#container`)
    container.classList.remove(`empty`)
}

App.container_loading = () => {
    App.set_container_info(`Loading...`)
}

App.set_container_info = (info) => {
    let container = DOM.el(`#container`)
    let item = DOM.create(`div`, `info_item`)
    item.innerHTML = info
    container.innerHTML = ``
    container.append(item)
    App.container_is_empty()
    App.unselect()
}

App.setup_status = () => {
    let status = DOM.el(`#change_status`)

    DOM.ev(status, `keydown`, (e) => {
        if (e.key === `ArrowUp`) {
            e.preventDefault()
        }
        else if (e.key === `ArrowDown`) {
            e.preventDefault()
        }
    })

    DOM.ev(status, `keyup`, (e) => {
        if (e.key === `Enter`) {
            App.change()
        }
        else if (e.key === `ArrowUp`) {
            App.show_status_menu()
        }
        else if (e.key === `ArrowDown`) {
            App.show_status_menu()
        }
    })

    status.value = ``
}

App.get_status_list = () => {
    let list = localStorage.getItem('status_list') || `[]`

    try {
        return JSON.parse(list)
    }
    catch (e) {
        return []
    }
}

App.save_status = (status) => {
    let cleaned = []

    for (let item of App.get_status_list()) {
        if (item !== status) {
            cleaned.push(item)
        }
    }

    let list = [status, ...cleaned].slice(0, App.max_status_list)
    localStorage.setItem(`status_list`, JSON.stringify(list))
}

App.show_status_menu = () => {
    let status_list = App.get_status_list()

    if (!status_list.length) {
        return
    }

    let items = status_list.map(status => {
        return {
            text: status,
            action: () => {
                App.set_status(status)
            }
        }
    })

    let el = DOM.el(`#change_status`)
    NeedContext.show({items: items, element: el})
}

App.set_status = (status) => {
    let el = DOM.el(`#change_status`)
    el.value = status
    App.focus_status()
}

App.focus_status = () => {
    DOM.el(`#change_status`).focus()
}

App.setup_updater = () => {
    let updater = DOM.el(`#updater`)

    DOM.ev(updater, `click`, () => {
        App.change_updater()
    })

    DOM.ev(updater, `auxclick`, (e) => {
        if (e.button === 1) {
            App.disable_updates()
        }
    })

    DOM.ev(updater, `wheel`, (e) => {
        let direction = App.wheel_direction(e)
        App.cycle_updater(direction)
    })

    App.update_debouncer = App.create_debouncer((force, feedback) => {
        App.do_update(force, feedback)
    }, App.update_debouncer_delay)

    App.load_updater()
}

App.get_updater = () => {
    return localStorage.getItem(`updater`) || `minutes_5`
}

App.check_updater = (saved) => {
    if (saved.startsWith(`minutes_`)) {
        let minutes = parseInt(saved.split(`_`)[1])
        App.update_delay = App.MINUTE * minutes
        App.updates_enabled = true
    }
    else {
        App.updates_enabled = false
    }

    App.restart_update()
}

App.restart_update = () => {
    clearTimeout(App.update_timeout)

    if (App.updates_enabled) {
        App.start_update_timeout()
    }
}

App.change_updater = () => {
    let saved = App.get_updater()
    saved = App.switch_state(saved, App.update_modes)
    localStorage.setItem(`updater`, saved)
    App.check_updater(saved)
    App.refresh_updater()
}

App.refresh_updater = () => {
    let el = DOM.el(`#updater`)
    let updater = App.get_updater()

    if (updater.startsWith(`minutes_`)) {
        let num = parseInt(updater.split(`_`)[1])
        let word = App.plural(num, `minute`, `minutes`)
        el.textContent = `Updating every ${num} ${word}`
    }
    else {
        el.textContent = `No auto updates`
    }
}

App.start_update_timeout = () => {
    App.update_timeout = setTimeout(() => {
        App.update()
    }, App.update_delay)
}

App.update = (force, feedback) => {
    App.update_debouncer.call(force, feedback)
}

App.do_update = (force = false, feedback = true) => {
    clearTimeout(App.update_timeout)

    if (force || App.updates_enabled) {
        App.update_curls(feedback)
    }

    App.restart_update()
}

App.update_curls = async (feedback = true) => {
    App.info(`Update: Trigger`)

    if (App.updating) {
        App.error(`Slow down`)
        return
    }

    let used_curls = App.get_used_curls()

    if (!used_curls.length) {
        App.empty_container()
        return
    }

    let url = `/curls`
    let params = new URLSearchParams()

    for (let curl of used_curls) {
        params.append(`curl`, curl);
    }

    if (feedback) {
        App.show_updating()
    }

    let response = ``
    App.updating = true
    App.info(`Update: Request ${App.network}`)

    if (!App.items.length) {
        App.container_loading()
    }

    try {
        response = await fetch(url, {
            method: `POST`,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`
            },
            body: params,
        })
    }
    catch (e) {
        App.error(`Failed to update`)
        App.clear_updating()
        return
    }

    try {
        let items = await response.json()
        App.insert_items(items)
    }
    catch (e) {
        App.error(`Failed to parse response`)
    }

    App.clear_updating()
}

App.show_updating = () => {
    let button = DOM.el(`#update`)
    clearTimeout(App.clear_updating_timeout)
    button.classList.add(`active`)
}

App.clear_updating = () => {
    App.updating = false

    App.clear_updating_timeout = setTimeout(() => {
        let button = DOM.el(`#update`)
        button.classList.remove(`active`)
    }, App.clear_delay)
}

App.set_updater = (what) => {
    localStorage.setItem(`updater`, what)
    App.check_updater(what)
    App.refresh_updater()
}

App.load_updater = () => {
    let saved = localStorage.getItem(`updater`) || `minutes_5`
    App.set_updater(saved)
}

App.disable_updates = () => {
    App.set_updater(`disabled`)
}

App.cycle_updater = (direction) => {
    let saved = App.get_updater()
    let reverse = direction === `up`
    saved = App.switch_state(saved, App.update_modes, reverse)
    App.set_updater(saved)
}

App.setup_sort = () => {
    let sort = DOM.el(`#sort`)

    DOM.ev(sort, `change`, (e) => {
        App.change_sort(e)
    })

    sort.value = App.load_sort()
}

App.change_sort = (e) => {
    let mode = e.target.value
    localStorage.setItem(`sort`, mode)
    App.refresh_items()
}

App.sort_if_order = () => {
    if (App.get_sort() == `order`) {
        App.refresh_items()
    }
}

App.sort_items = (items) => {
    let mode = App.get_sort()

    if (mode === `order`) {
        let used_curls = App.get_used_curls()

        items.sort((a, b) => {
            return used_curls.indexOf(a.curl) - used_curls.indexOf(b.curl)
        })
    }
    else if (mode === `newest`) {
        items.sort((a, b) => {
            let compare = b.updated.localeCompare(a.updated)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    if (mode === `oldest`) {
        items.sort((a, b) => {
            let compare = a.updated.localeCompare(b.updated)
            return compare !== 0 ? compare : a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `ascending`) {
        items.sort((a, b) => {
            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `descending`) {
        items.sort((a, b) => {
            return b.curl.localeCompare(a.curl)
        })
    }
    else if (mode === `short`) {
        // Sort by length and then alpha
        items.sort((a, b) => {
            let diff = a.curl.length - b.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
    else if (mode === `long`) {
        // Sort by length and then alpha
        items.sort((a, b) => {
            let diff = b.curl.length - a.curl.length

            if (diff !== 0) {
                return diff
            }

            return a.curl.localeCompare(b.curl)
        })
    }
}

App.load_sort = () => {
    let defvalue = `newest`
    let saved = localStorage.getItem(`sort`) || defvalue
    let values = Array.from(sort.options).map(option => option.value)

    if (!values.includes(saved)) {
        saved = defvalue
    }

    return saved
}

App.get_sort = () => {
    return DOM.el(`#sort`).value
}

App.setup_filter = () => {
    let filter = DOM.el(`#filter`)

    DOM.ev(filter, `keyup`, (e) => {
        if (e.key === `Escape`) {
            App.clear_filter()
        }

        App.filter()
    })

    App.filter_debouncer = App.create_debouncer(App.do_filter, App.filter_debouncer_delay)
    filter.value = ``

    let button = DOM.el(`#filter_button`)

    DOM.ev(button, `click`, (e) => {
        App.show_filter_menu(e)
    })

    DOM.ev(button, `auxclick`, (e) => {
        if (e.button === 1) {
            App.clear_filter()
        }
    })
}

App.clear_filter = () => {
    let filter = DOM.el(`#filter`)
    filter.value = ``
    App.unfilter_all()
}

App.filter = () => {
    App.filter_debouncer.call()
}

App.do_filter = () => {
    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    let value = DOM.el(`#filter`).value.toLowerCase().trim()
    let is_special = false
    let special = []

    if (value.startsWith(`[owned]`)) {
        special = App.get_owned_items()
        is_special = true
    }
    else if (value.startsWith(`[today]`)) {
        special = App.get_today_items()
        is_special = true
    }
    else if (value.startsWith(`[week]`)) {
        special = App.get_week_items()
        is_special = true
    }
    else if (value.startsWith(`[month]`)) {
        special = App.get_month_items()
        is_special = true
    }

    if (is_special) {
        value = value.split(` `).slice(1).join(` `)
    }

    function hide (el) {
        el.classList.add(`hidden`)
    }

    function unhide (el) {
        el.classList.remove(`hidden`)
    }

    function check (curl, status, updated) {
        return curl.includes(value) || status.includes(value) || updated.includes(value)
    }

    for (let el of els) {
        let item = App.get_item(el.dataset.curl)
        let curl = item.curl.toLowerCase()
        let status = item.status.toLowerCase()
        let updated = item.updated.toLowerCase()

        if (is_special) {
            if (special.find(s => s.curl === item.curl)) {
                if (check(curl, status, updated)) {
                    unhide(el)
                }
                else {
                    hide(el)
                }
            }
            else {
                hide(el)
            }
        }
        else {
            if (check(curl, status, updated)) {
                unhide(el)
            }
            else {
                hide(el)
            }
        }
    }

    App.check_visible()
}

App.unfilter_all = () => {
    let els = DOM.els(`#container .item`)

    if (!els.length) {
        return
    }

    for (let el of els) {
        el.classList.remove(`hidden`)
    }

    App.check_visible()
}

App.filter_owned = () => {
    App.set_filter(`[owned]`)
    App.do_filter()
}

App.filter_today = () => {
    App.set_filter(`[today]`)
    App.do_filter()
}

App.filter_week = () => {
    App.set_filter(`[week]`)
    App.do_filter()
}

App.filter_month = () => {
    App.set_filter(`[month]`)
    App.do_filter()
}

App.set_filter = (value) => {
    let el = DOM.el(`#filter`)
    el.value = value + ` `
    el.focus()
}

App.show_filter_menu = (e) => {
    let items = [
        {
            text: `Clear`,
            action: () => {
                App.clear_filter()
            }
        },
        {
            text: `Owned`,
            action: () => {
                App.filter_owned()
            }
        },
        {
            text: `Today`,
            action: () => {
                App.filter_today()
            }
        },
        {
            text: `Week`,
            action: () => {
                App.filter_week()
            }
        },
        {
            text: `Month`,
            action: () => {
                App.filter_month()
            }
        },
    ]

    NeedContext.show({items: items, e: e})
}

App.check_filter = () => {
    let filter = DOM.el(`#filter`)

    if (filter.value) {
        App.do_filter()
    }
}

window.onload = () => {
    App.setup()
}

