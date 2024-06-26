// NeedContext v5.4

// Main object
const NeedContext = {}
NeedContext.created = false

// Overridable function to perform after show
NeedContext.after_show = () => {}

// Overridable function to perform after hide
NeedContext.after_hide = () => {}

// Minimum menu width and height
NeedContext.min_width = `25px`
NeedContext.min_height = `25px`
NeedContext.back_icon = `⬅️`
NeedContext.back_text = `Back`
NeedContext.clear_text = `Clear`
NeedContext.item_sep = `4px`
NeedContext.layers = {}
NeedContext.level = 0
NeedContext.gap = `0.5rem`
NeedContext.side_padding = `0.5rem`
NeedContext.center_top = 20
NeedContext.dragging = false

// Set defaults
NeedContext.set_defaults = () => {
  NeedContext.open = false
  NeedContext.mousedown = false
  NeedContext.first_mousedown = false
  NeedContext.keydown = false
  NeedContext.filtered = false
  NeedContext.last_x = 0
  NeedContext.last_y = 0
  NeedContext.layers = {}
}

// Clear the filter
NeedContext.clear_filter = () => {
  NeedContext.filter.value = ``
  NeedContext.do_filter()
  NeedContext.filter.focus()
}

// Filter from keyboard input
NeedContext.do_filter = () => {
  let value = NeedContext.filter.value
  let cleaned = NeedContext.remove_spaces(value).toLowerCase()
  let selected = false

  for (let el of document.querySelectorAll(`.needcontext-separator`)) {
    if (cleaned) {
      el.classList.add(`needcontext-hidden`)
    }
    else {
      el.classList.remove(`needcontext-hidden`)
    }
  }

  for (let text_el of document.querySelectorAll(`.needcontext-text`)) {
    let el = text_el.closest(`.needcontext-item`)
    let text = text_el.textContent.toLowerCase()
    text = NeedContext.remove_spaces(text)

    if (text.includes(cleaned)) {
      el.classList.remove(`needcontext-hidden`)

      if (!selected) {
        NeedContext.select_item(parseInt(el.dataset.index))
        selected = true
      }
    }
    else {
      el.classList.add(`needcontext-hidden`)
    }
  }

  let back = document.querySelector(`#needcontext-back`)
  let clear = document.querySelector(`#needcontext-clear`)
  NeedContext.filtered = cleaned !== ``

  if (NeedContext.filtered) {
    let text = document.querySelector(`#needcontext-clear-text`)
    text.textContent = value.trim()
    clear.classList.remove(`needcontext-hidden`)

    if (back) {
      back.classList.add(`needcontext-hidden`)
    }
  }
  else {
    clear.classList.add(`needcontext-hidden`)

    if (back) {
      back.classList.remove(`needcontext-hidden`)
    }
  }

  NeedContext.scroll_to_selected()
}

// Fill arg objects
NeedContext.def_args = (def, args) => {
  for (let key in def) {
    if ((args[key] === undefined) && (def[key] !== undefined)) {
      args[key] = def[key]
    }
  }
}

// Show the menu
NeedContext.show = (args = {}) => {
  let def_args = {
    root: true,
    expand: false,
    picker_mode: false,
    margin: 0,
  }

  NeedContext.def_args(def_args, args)

  if (!NeedContext.created) {
    NeedContext.create()
  }

  if (args.e && args.e.clientX !== undefined && args.e.clientY !== undefined) {
    args.x = args.e.clientX
    args.y = args.e.clientY
  }
  else if (args.element) {
    let rect = args.element.getBoundingClientRect()
    args.x = rect.left
    args.y = rect.top + args.margin
  }

  if (args.root) {
    NeedContext.level = 0
  }

  let center = args.x === undefined || args.y === undefined
  args.items = args.items.slice(0)

  if (args.index === undefined) {
    let items = args.items.filter(x => !x.separator)

    for (let [i, item] of items.entries()) {
      if (item.selected) {
        args.index = i
        break
      }
    }
  }

  if (args.index === undefined) {
    args.index = 0
  }

  let selected_index
  let layer = NeedContext.get_layer()

  if (layer) {
    selected_index = layer.last_index
  }
  else {
    selected_index = args.index
  }

  selected_index = selected_index || 0

  for (let [i, item] of args.items.entries()) {
    if (i === selected_index) {
      item.selected = true
    }
    else {
      item.selected = false
    }
  }

  let c = NeedContext.container
  c.innerHTML = ``
  let index = 0

  if (args.title) {
    let title = document.createElement(`div`)
    title.id = `needcontext-title`

    if (args.title_icon) {
      let icon = document.createElement(`div`)
      icon.classList.add(`needcontext-title-icon`)
      title.append(args.title_icon)
    }

    let text = document.createElement(`div`)
    text.textContent = args.title.trim()
    title.append(text)
    c.append(title)

    if (args.title_number) {
      let number = document.createElement(`div`)
      number.classList.add(`needcontext-title-number`)
      title.append(number)
    }

    c.classList.add(`with_title`)
    c.classList.remove(`without_title`)
  }
  else {
    c.classList.remove(`with_title`)
    c.classList.add(`without_title`)
  }

  if (!args.root) {
    c.append(NeedContext.back_button())
  }

  c.append(NeedContext.clear_button())
  let normal_items = []

  for (let item of args.items) {
    let el = document.createElement(`div`)
    el.classList.add(`needcontext-item`)

    if (item.separator) {
      el.classList.add(`needcontext-separator`)
    }
    else {
      el.classList.add(`needcontext-normal`)

      if (item.image) {
        let image = document.createElement(`img`)
        image.loading = `lazy`

        image.addEventListener(`error`, (e) => {
          e.target.classList.add(`needcontext-hidden`)
        })

        image.classList.add(`needcontext-image`)
        image.src = item.image
        el.append(image)
      }

      if (item.icon) {
        let icon = document.createElement(`div`)
        icon.classList.add(`needcontext-icon`)

        if (item.icon_action) {
          icon.addEventListener(`click`, (e) => {
            item.icon_action(e, icon)
          })
        }

        icon.append(item.icon)
        el.append(icon)
      }

      if (item.text) {
        let text = document.createElement(`div`)
        text.classList.add(`needcontext-text`)
        text.textContent = item.text.trim()
        el.append(text)
      }

      if (item.info) {
        el.title = item.info.trim()
      }

      if (item.bold) {
        el.classList.add(`needcontext-bold`)
      }

      el.dataset.index = index
      item.index = index

      el.addEventListener(`mousemove`, () => {
        let index = parseInt(el.dataset.index)

        if (NeedContext.index !== index) {
          NeedContext.select_item(index)
        }
      })

      index += 1
      normal_items.push(item)
    }

    if (args.on_drag) {
      el.draggable = true
    }

    item.element = el
    item.picked = false
    c.append(el)
  }

  NeedContext.layers[NeedContext.level] = {
    root: args.root,
    items: args.items,
    normal_items: normal_items,
    last_index: selected_index,
    x: args.x,
    y: args.y,
  }

  NeedContext.main.classList.remove(`needcontext-hidden`)

  if (center) {
    c.style.left = `50%`
    c.style.transform = `translateX(-50%)`
    args.y = NeedContext.center_top
  }

  if (args.y < 5) {
    args.y = 5
  }

  if (args.x < 5) {
    args.x = 5
  }

  if ((args.y + c.offsetHeight) + 5 > window.innerHeight) {
    args.y = window.innerHeight - c.offsetHeight - 5
  }

  if ((args.x + c.offsetWidth) + 5 > window.innerWidth) {
    args.x = window.innerWidth - c.offsetWidth - 5
  }

  NeedContext.last_x = args.x
  NeedContext.last_y = args.y
  args.x = Math.max(args.x, 0)
  args.y = Math.max(args.y, 0)
  c.style.top = `${args.y}px`

  if (!center) {
    c.style.left = `${args.x}px`
    c.style.transform = `unset`
  }

  NeedContext.filter.value = ``
  NeedContext.filter.focus()
  let container = document.querySelector(`#needcontext-container`)

  if (args.expand && args.element) {
    container.style.minWidth = `${args.element.clientWidth}px`
  }
  else {
    container.style.minWidth = NeedContext.min_width
  }

  container.style.minHeight = NeedContext.min_height
  NeedContext.select_item(selected_index)
  NeedContext.update_title()
  NeedContext.scroll_to_selected()
  NeedContext.open = true
  NeedContext.after_show()

  if (args.root) {
    NeedContext.args = args
  }
}

// Hide the menu
NeedContext.hide = (e) => {
  if (NeedContext.open) {
    NeedContext.main.classList.add(`needcontext-hidden`)
    NeedContext.set_defaults()
    NeedContext.after_hide()

    if (NeedContext.args.after_hide) {
      NeedContext.args.after_hide(e)
    }
  }
}

// Select an item by index
NeedContext.select_item = (index) => {
  let els = Array.from(document.querySelectorAll(`.needcontext-normal`))

  for (let el of els) {
    let i = parseInt(el.dataset.index)

    if (i === index) {
      el.classList.add(`needcontext-item-selected`)
    }
    else {
      el.classList.remove(`needcontext-item-selected`)
    }
  }

  NeedContext.index = index
}

NeedContext.scroll_to_selected = (block = `center`) => {
  let el = document.querySelector(`.needcontext-item-selected`)

  if (el) {
    el.scrollIntoView({block: block})
  }
}

// Select an item above or below
NeedContext.select_next = (direction = `down`, bounce = false) => {
  let waypoint = false
  let first_visible
  let items = NeedContext.get_layer().normal_items.slice(0)
  items = items.filter(x => !x.removed)

  if (direction === `up`) {
    items.reverse()
  }

  for (let item of items) {
    if (!NeedContext.is_visible(item.element)) {
      continue
    }

    if (first_visible === undefined) {
      first_visible = item.index
    }

    if (waypoint) {
      NeedContext.select_item(item.index)
      NeedContext.scroll_to_selected(`nearest`)
      return
    }

    if (item.index === NeedContext.index) {
      waypoint = true
    }
  }

  if (!bounce) {
    NeedContext.select_item(first_visible)
    NeedContext.scroll_to_selected(`nearest`)
    return true
  }
  else {
    NeedContext.select_next(`up`)
  }
}

// Do the selected action
NeedContext.select_action = async (e, index = NeedContext.index, mode = `mouse`) => {
  if (mode === `mouse`) {
    if (!e.target.closest(`.needcontext-normal`)) {
      return
    }
  }

  let x = NeedContext.last_x
  let y = NeedContext.last_y
  let item = NeedContext.get_layer().normal_items[index]

  function show_below (items) {
    NeedContext.get_layer().last_index = index
    NeedContext.level += 1

    if (e.clientY) {
      y = e.clientY
    }

    NeedContext.show({x: x, y: y, items: items, root: false})
  }

  function do_items (items) {
    if (items.length === 1 && items[0].direct) {
      NeedContext.action(items[0], e)
    }
    else {
      show_below(items)
    }

    return
  }

  async function check_item () {
    if (item.action) {
      NeedContext.action(item, e)
      return
    }
    else if (item.items) {
      do_items(item.items)
    }
    else if (item.get_items) {
      let items = await item.get_items()
      do_items(items)
    }
  }

  if (mode === `keyboard`) {
    check_item()
    return
  }

  if (e.button === 0) {
    check_item()
  }
  else if (e.button === 1) {
    if (item.alt_action) {
      NeedContext.alt_action(item, e)
    }
  }
  else if (e.button === 2) {
    if (item.context_action) {
      NeedContext.context_action(item, e)
    }
  }
}

// Check if item is hidden
NeedContext.is_visible = (el) => {
  return !el.classList.contains(`needcontext-hidden`)
}

// Remove all spaces from text
NeedContext.remove_spaces = (text) => {
  return text.replace(/[\s-]+/g, ``)
}

// Prepare css and events
NeedContext.init = () => {
  let style = document.createElement(`style`)

  let css = `
    #needcontext-main {
      position: fixed;
      z-index: 999999999;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    .needcontext-hidden {
      display: none !important;
    }

    #needcontext-container {
      z-index: 2;
      position: absolute;
      background-color: white;
      color: black;
      font-size: 16px;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      user-select: none;
      border: 1px solid #2B2F39;
      border-radius: 5px;
      padding-bottom: 5px;
      max-height: 80vh;
      overflow-y: auto;
      overflow-x: hidden;
      text-align: left;
      max-width: 98%;
    }

    #needcontext-container.without_title {
      padding-top: 5px;
    }

    #needcontext-title {
      font-weight: bold;
      padding-left: ${NeedContext.side_padding};
      padding-right: ${NeedContext.side_padding};
      background-color: rgba(67, 220, 255, 0.47);
      padding-top: 4px;
      padding-bottom: 4px;
      margin-bottom: 2px;
      display: flex;
      flex-direction: row;
      gap: ${NeedContext.gap};
      align-items: center;
      justify-content: flex-start;
    }

    #needcontext-filter {
      opacity: 0;
    }

    .needcontext-item {
      white-space: nowrap;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: ${NeedContext.gap};
    }

    .needcontext-normal {
      padding-left: ${NeedContext.side_padding};
      padding-right: ${NeedContext.side_padding};
      padding-top: ${NeedContext.item_sep};
      padding-bottom: ${NeedContext.item_sep};
      cursor: pointer;
    }

    .needcontext-picked .needcontext-text {
      text-decoration: line-through;
      opacity: 0.7;
    }

    .needcontext-button {
      padding-left: ${NeedContext.side_padding};
      padding-right: ${NeedContext.side_padding};
      padding-top: ${NeedContext.item_sep};
      padding-bottom: ${NeedContext.item_sep};
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: ${NeedContext.gap};
      cursor: pointer;
    }

    .needcontext-button:hover {
      text-shadow: 0 0 1rem currentColor;
    }

    .needcontext-separator {
      border-top: 1px solid currentColor;
      margin-left: ${NeedContext.side_padding};
      margin-right: ${NeedContext.side_padding};
      margin-top: ${NeedContext.item_sep};
      margin-bottom: ${NeedContext.item_sep};
      opacity: 0.7;
    }

    .needcontext-item-selected {
      background-color: rgba(0, 0, 0, 0.18);
    }

    .needcontext-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .needcontext-image {
      width: 1.11rem;
      height: 1.11rem;
      object-fit: contain;
      margin-right: 0.1rem;
    }

    .needcontext-bold {
      font-weight: bold;
    }
  `

  style.innerText = css
  document.head.appendChild(style)

  document.addEventListener(`mousedown`, (e) => {
    if (!NeedContext.open || !e.target) {
      return
    }

    NeedContext.first_mousedown = true

    if (e.target.closest(`#needcontext-container`)) {
      NeedContext.mousedown = true
    }
  })

  document.addEventListener(`mouseup`, (e) => {
    if (!NeedContext.open || !e.target) {
      return
    }

    if (!e.target.closest(`#needcontext-container`)) {
      if (NeedContext.first_mousedown) {
        NeedContext.dismiss(e)
      }
    }
    else if (e.target.closest(`.needcontext-back`)) {
      if (e.button === 0) {
        NeedContext.go_back()
      }
    }
    else if (e.target.closest(`.needcontext-clear`)) {
      if (e.button === 0) {
        NeedContext.clear_filter()
      }
    }
    else if (NeedContext.mousedown) {
      NeedContext.select_action(e)
    }

    NeedContext.mousedown = false
  })

  document.addEventListener(`keydown`, (e) => {
    if (!NeedContext.open) {
      return
    }

    if (NeedContext.modkey(e)) {
      return
    }

    NeedContext.keydown = true

    if (e.key === `ArrowUp`) {
      NeedContext.select_next(`up`)
      e.preventDefault()
    }
    else if (e.key === `ArrowDown`) {
      NeedContext.select_next()
      e.preventDefault()
    }
    else if (e.key === `Backspace`) {
      if (!NeedContext.filtered) {
        NeedContext.go_back()
        e.preventDefault()
      }
    }
  })

  document.addEventListener(`keyup`, (e) => {
    if (!NeedContext.open) {
      return
    }

    if (!NeedContext.keydown) {
      return
    }

    if (NeedContext.modkey(e)) {
      return
    }

    NeedContext.keydown = false

    if (e.key === `Escape`) {
      NeedContext.dismiss(e)
      e.preventDefault()
    }
    else if (e.key === `Enter`) {
      NeedContext.select_action(e, undefined, `keyboard`)
      e.preventDefault()
    }
  })

  NeedContext.set_defaults()
}

// Create elements
NeedContext.create = () => {
  NeedContext.main = document.createElement(`div`)
  NeedContext.main.id = `needcontext-main`
  NeedContext.main.classList.add(`needcontext-hidden`)
  NeedContext.container = document.createElement(`div`)
  NeedContext.container.id = `needcontext-container`
  NeedContext.filter = document.createElement(`input`)
  NeedContext.filter.id = `needcontext-filter`
  NeedContext.filter.type = `text`
  NeedContext.filter.autocomplete = `off`
  NeedContext.filter.spellcheck = false
  NeedContext.filter.placeholder = `Filter`

  NeedContext.filter.addEventListener(`input`, (e) => {
    NeedContext.do_filter()
  })

  NeedContext.main.addEventListener(`contextmenu`, (e) => {
    e.preventDefault()
  })

  NeedContext.container.addEventListener(`dragstart`, (e) => {
    NeedContext.dragging = true
    NeedContext.dragstart_action(e)
  })

  NeedContext.container.addEventListener(`dragenter`, (e) => {
    NeedContext.dragenter_action(e)
  })

  NeedContext.container.addEventListener(`dragend`, (e) => {
    NeedContext.dragging = false
    NeedContext.dragend_action(e)
  })

  NeedContext.main.append(NeedContext.filter)
  NeedContext.main.append(NeedContext.container)
  document.body.appendChild(NeedContext.main)
  NeedContext.created = true
}

// Drag start
NeedContext.dragstart_action = (e) => {
  if (NeedContext)
  NeedContext.dragged_item = e.target
  let list = NeedContext.container
  let items = Array.from(list.querySelectorAll(`.needcontext-item`))
  NeedContext.dragged_index = items.indexOf(e.target)
}

// Drag enter
NeedContext.dragenter_action = (e) => {
  let dragged = NeedContext.dragged_item

  if (dragged === e.target) {
    return
  }

  let list = NeedContext.container
  let items = Array.from(list.querySelectorAll(`.needcontext-item`))
  let index_dragged = items.indexOf(dragged)
  let index_target = items.indexOf(e.target)

  if ((index_dragged < 0) || (index_target < 0)) {
    return
  }

  if (index_dragged < index_target) {
    list.insertBefore(dragged, e.target.nextSibling)
  }
  else {
    list.insertBefore(dragged, e.target)
  }

  NeedContext.select_item(index_target)
}

// Drag end
NeedContext.dragend_action = (e) => {
  let list = NeedContext.container
  let dragged = NeedContext.dragged_item
  let items = Array.from(list.querySelectorAll(`.needcontext-item`))
  let index_end = items.indexOf(dragged)
  NeedContext.hide(e)
  NeedContext.args.on_drag(NeedContext.dragged_index, index_end)
}

// Current layer
NeedContext.get_layer = () => {
  return NeedContext.layers[NeedContext.level]
}

// Previous layer
NeedContext.prev_layer = () => {
  return NeedContext.layers[NeedContext.level - 1]
}

// Go back to previous layer
NeedContext.go_back = () => {
  if (NeedContext.level === 0) {
    return
  }

  let layer = NeedContext.prev_layer()
  NeedContext.level -= 1
  NeedContext.show({x: layer.x, y: layer.y, items: layer.items, root: layer.root})
}

// Create back button
NeedContext.back_button = () => {
  let el = document.createElement(`div`)
  el.id = `needcontext-back`
  el.classList.add(`needcontext-back`)
  el.classList.add(`needcontext-button`)
  let icon = document.createElement(`div`)
  icon.append(NeedContext.back_icon)
  let text = document.createElement(`div`)
  text.textContent = NeedContext.back_text.trim()
  el.append(icon)
  el.append(text)
  el.title = `Shortcut: Backspace`
  return el
}

// Create clear button
NeedContext.clear_button = () => {
  let el = document.createElement(`div`)
  el.id = `needcontext-clear`
  el.classList.add(`needcontext-clear`)
  el.classList.add(`needcontext-button`)
  el.classList.add(`needcontext-hidden`)
  let icon = document.createElement(`div`)
  icon.append(NeedContext.back_icon)
  let text = document.createElement(`div`)
  text.id = `needcontext-clear-text`
  text.textContent = NeedContext.clear_text.trim()
  el.append(icon)
  el.append(text)
  el.title = `Type to filter. Click to clear`
  return el
}

// Return true if a mod key is pressed
NeedContext.modkey = (e) => {
  return e.ctrlKey || e.altKey || e.shiftKey || e.metaKey
}

// Do an action
NeedContext.action = (item, e) => {
  if (item.element) {
    if (!NeedContext.is_visible(item.element)) {
      return
    }

    if (e.target.closest(`.needcontext-icon`)) {
      if (item.icon_action) {
        return
      }
    }
  }

  let args = NeedContext.args
  let after_action = NeedContext.args.after_action

  if (args.picker_mode) {
    item.element.classList.add(`needcontext-picked`)
    NeedContext.filter.focus()
    item.picked = true
    let all_picked = true

    for (let item of args.items) {
      if (!item.picked) {
        all_picked = false
        break
      }
    }

    if (all_picked) {
      NeedContext.hide(e)
    }
  }
  else {
    NeedContext.hide(e)
  }

  item.action(e)

  if (after_action) {
    after_action(e)
  }
}

// Dismissed by clicking the overlay or Escape
NeedContext.dismiss = (e) => {
  if (NeedContext.args.after_dismiss) {
    NeedContext.args.after_dismiss(e)
  }

  NeedContext.hide(e)
}

// Alternative action
NeedContext.alt_action = (item, e) => {
  if (item.element) {
    if (!NeedContext.is_visible(item.element)) {
      return
    }
  }

  if (NeedContext.args.after_alt_action) {
    NeedContext.args.after_alt_action(e)
  }

  if (NeedContext.args.alt_action_remove) {
    NeedContext.remove_item(item)
  }
  else {
    NeedContext.hide(e)
  }

  item.alt_action(e)
}

// Context (right click) action
NeedContext.context_action = (item, e) => {
  if (item.element) {
    if (!NeedContext.is_visible(item.element)) {
      return
    }
  }

  if (NeedContext.args.after_context_action) {
    NeedContext.args.after_context_action(e)
  }

  NeedContext.hide(e)
  item.context_action(e)
}

// Remove an item
NeedContext.remove_item = (item) => {
  NeedContext.select_next(`down`, true)
  item.removed = true
  item.element.remove()
  NeedContext.update_title()
}

// Update the title
NeedContext.update_title = () => {
  let title = document.querySelector(`#needcontext-title`)

  if (!title) {
    return
  }

  let number = title.querySelector(`.needcontext-title-number`)

  if (!number) {
    return
  }

  let num_items = NeedContext.count_items()
  number.textContent = `(${num_items})`
}

// Count the number of items
NeedContext.count_items = () => {
  items = NeedContext.get_layer().normal_items
  items = items.filter(x => !x.removed)
  items = items.filter(x => !x.fake)
  return items.length
}

// Start
NeedContext.init()

/*
* Date Format 1.2.3
* (c) 2007-2009 Steven Levithan <stevenlevithan.com>
* MIT license
*
* Includes enhancements by Scott Trenda <scott.trenda.net>
* and Kris Kowal <cixar.com/~kris.kowal/>
*
* Accepts a date, a mask, or a date and a mask.
* Returns a formatted version of the given date.
* The date defaults to the current date/time.
* The mask defaults to dateFormat.masks.default.
*/

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
		    val = String(val);
		    len = len || 2;
		    while (val.length < len) val = "0" + val;
		    return val;
		};

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
			    d: d,
			    dd: pad(d),
			    ddd: dF.i18n.dayNames[D],
			    dddd: dF.i18n.dayNames[D + 7],
			    m: m + 1,
			    mm: pad(m + 1),
			    mmm: dF.i18n.monthNames[m],
			    mmmm: dF.i18n.monthNames[m + 12],
			    yy: String(y).slice(2),
			    yyyy: y,
			    h: H % 12 || 12,
			    hh: pad(H % 12 || 12),
			    H: H,
			    HH: pad(H),
			    M: M,
			    MM: pad(M),
			    s: s,
			    ss: pad(s),
			    l: pad(L, 3),
			    L: pad(L > 99 ? Math.round(L / 10) : L),
			    t: H < 12 ? "a" : "p",
			    tt: H < 12 ? "am" : "pm",
			    T: H < 12 ? "A" : "P",
			    TT: H < 12 ? "AM" : "PM",
			    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
} ();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
    monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};


// DOM v1.0.0
const DOM = {}
DOM.dataset_obj = {}
DOM.dataset_id = 0

// Select a single element
DOM.el = (query, root = document) => {
  return root.querySelector(query)
}

// Select an array of elements
DOM.els = (query, root = document) => {
  return Array.from(root.querySelectorAll(query))
}

// Select a single element or self
DOM.el_or_self = (query, root = document) => {
  let el = root.querySelector(query)

  if (!el) {
    if (root.classList.contains(query.replace(`.`, ``))) {
      el = root
    }
  }

  return el
}

// Select an array of elements or self
DOM.els_or_self = (query, root = document) => {
  let els = Array.from(root.querySelectorAll(query))

  if (els.length === 0) {
    if (root.classList.contains(query.replace(`.`, ``))) {
      els = [root]
    }
  }

  return els
}

// Clone element
DOM.clone = (el) => {
  return el.cloneNode(true)
}

// Clone element children
DOM.clone_children = (query) => {
  let items = []
  let children = Array.from(DOM.el(query).children)

  for (let c of children) {
    items.push(DOM.clone(c))
  }

  return items
}

// Data set manager
DOM.dataset = (el, value, setvalue) => {
  if (!el) {
    return
  }

  let id = el.dataset.dataset_id

  if (!id) {
    id = DOM.dataset_id
    DOM.dataset_id += 1
    el.dataset.dataset_id = id
    DOM.dataset_obj[id] = {}
  }

  if (setvalue !== undefined) {
    DOM.dataset_obj[id][value] = setvalue
  }
  else {
    return DOM.dataset_obj[id][value]
  }
}

// Create an html element
DOM.create = (type, classes = ``, id = ``) => {
  let el = document.createElement(type)

  if (classes) {
    let classlist = classes.split(` `).filter(x => x != ``)

    for (let cls of classlist) {
      el.classList.add(cls)
    }
  }

  if (id) {
    el.id = id
  }

  return el
}

// Add an event listener
DOM.ev = (element, event, callback, extra) => {
  element.addEventListener(event, callback, extra)
}

// Add multiple event listeners
DOM.evs = (element, events, callback, extra) => {
  for (let event of events) {
    element.addEventListener(event, callback, extra)
  }
}

// Like jQuery's nextAll
DOM.next_all = function* (e, selector) {
  while (e = e.nextElementSibling) {
    if (e.matches(selector)) {
      yield e;
    }
  }
}

// Get item index
DOM.index = (el) => {
  return Array.from(el.parentNode.children).indexOf(el)
}

/**
 * Jdenticon 3.3.0
 * http://jdenticon.com
 *
 * Built: 2024-05-10T09:48:41.921Z
 *
 * MIT License
 *
 * Copyright (c) 2014-2024 Daniel Mester Pirttijärvi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (umdGlobal, factory) {
    var jdenticon = factory(umdGlobal);

    // Node.js
    if (typeof module !== "undefined" && "exports" in module) {
        module["exports"] = jdenticon;
    }
    // RequireJS
    else if (typeof define === "function" && define["amd"]) {
        define([], function () { return jdenticon; });
    }
    // No module loader
    else {
        umdGlobal["jdenticon"] = jdenticon;
    }
})(typeof self !== "undefined" ? self : this, function (umdGlobal) {
'use strict';

/**
 * Parses a substring of the hash as a number.
 * @param {number} startPosition
 * @param {number=} octets
 */
function parseHex(hash, startPosition, octets) {
    return parseInt(hash.substr(startPosition, octets), 16);
}

function decToHex(v) {
    v |= 0; // Ensure integer value
    return v < 0 ? "00" :
        v < 16 ? "0" + v.toString(16) :
        v < 256 ? v.toString(16) :
        "ff";
}

function hueToRgb(m1, m2, h) {
    h = h < 0 ? h + 6 : h > 6 ? h - 6 : h;
    return decToHex(255 * (
        h < 1 ? m1 + (m2 - m1) * h :
        h < 3 ? m2 :
        h < 4 ? m1 + (m2 - m1) * (4 - h) :
        m1));
}

/**
 * @param {string} color  Color value to parse. Currently hexadecimal strings on the format #rgb[a] and #rrggbb[aa] are supported.
 * @returns {string}
 */
function parseColor(color) {
    if (/^#[0-9a-f]{3,8}$/i.test(color)) {
        var result;
        var colorLength = color.length;

        if (colorLength < 6) {
            var r = color[1],
                  g = color[2],
                  b = color[3],
                  a = color[4] || "";
            result = "#" + r + r + g + g + b + b + a + a;
        }
        if (colorLength == 7 || colorLength > 8) {
            result = color;
        }

        return result;
    }
}

/**
 * Converts a hexadecimal color to a CSS3 compatible color.
 * @param {string} hexColor  Color on the format "#RRGGBB" or "#RRGGBBAA"
 * @returns {string}
 */
function toCss3Color(hexColor) {
    var a = parseHex(hexColor, 7, 2);
    var result;

    if (isNaN(a)) {
        result = hexColor;
    } else {
        var r = parseHex(hexColor, 1, 2),
            g = parseHex(hexColor, 3, 2),
            b = parseHex(hexColor, 5, 2);
        result = "rgba(" + r + "," + g + "," + b + "," + (a / 255).toFixed(2) + ")";
    }

    return result;
}

/**
 * Converts an HSL color to a hexadecimal RGB color.
 * @param {number} hue  Hue in range [0, 1]
 * @param {number} saturation  Saturation in range [0, 1]
 * @param {number} lightness  Lightness in range [0, 1]
 * @returns {string}
 */
function hsl(hue, saturation, lightness) {
    // Based on http://www.w3.org/TR/2011/REC-css3-color-20110607/#hsl-color
    var result;

    if (saturation == 0) {
        var partialHex = decToHex(lightness * 255);
        result = partialHex + partialHex + partialHex;
    }
    else {
        var m2 = lightness <= 0.5 ? lightness * (saturation + 1) : lightness + saturation - lightness * saturation,
              m1 = lightness * 2 - m2;
        result =
            hueToRgb(m1, m2, hue * 6 + 2) +
            hueToRgb(m1, m2, hue * 6) +
            hueToRgb(m1, m2, hue * 6 - 2);
    }

    return "#" + result;
}

/**
 * Converts an HSL color to a hexadecimal RGB color. This function will correct the lightness for the "dark" hues
 * @param {number} hue  Hue in range [0, 1]
 * @param {number} saturation  Saturation in range [0, 1]
 * @param {number} lightness  Lightness in range [0, 1]
 * @returns {string}
 */
function correctedHsl(hue, saturation, lightness) {
    // The corrector specifies the perceived middle lightness for each hue
    var correctors = [ 0.55, 0.5, 0.5, 0.46, 0.6, 0.55, 0.55 ],
          corrector = correctors[(hue * 6 + 0.5) | 0];

    // Adjust the input lightness relative to the corrector
    lightness = lightness < 0.5 ? lightness * corrector * 2 : corrector + (lightness - 0.5) * (1 - corrector) * 2;

    return hsl(hue, saturation, lightness);
}

/* global umdGlobal */

// In the future we can replace `GLOBAL` with `globalThis`, but for now use the old school global detection for
// backward compatibility.
var GLOBAL = umdGlobal;

/**
 * @typedef {Object} ParsedConfiguration
 * @property {number} colorSaturation
 * @property {number} grayscaleSaturation
 * @property {string} backColor
 * @property {number} iconPadding
 * @property {function(number):number} hue
 * @property {function(number):number} colorLightness
 * @property {function(number):number} grayscaleLightness
 */

var CONFIG_PROPERTIES = {
    G/*GLOBAL*/: "jdenticon_config",
    n/*MODULE*/: "config",
};

var rootConfigurationHolder = {};

/**
 * Defines the deprecated `config` property on the root Jdenticon object without printing a warning in the console
 * when it is being used.
 * @param {!Object} rootObject
 */
function defineConfigProperty(rootObject) {
    rootConfigurationHolder = rootObject;
}

/**
 * Sets a new icon style configuration. The new configuration is not merged with the previous one. *
 * @param {Object} newConfiguration - New configuration object.
 */
function configure(newConfiguration) {
    if (arguments.length) {
        rootConfigurationHolder[CONFIG_PROPERTIES.n/*MODULE*/] = newConfiguration;
    }
    return rootConfigurationHolder[CONFIG_PROPERTIES.n/*MODULE*/];
}

/**
 * Gets the normalized current Jdenticon color configuration. Missing fields have default values.
 * @param {Object|number|undefined} paddingOrLocalConfig - Configuration passed to the called API method. A
 *    local configuration overrides the global configuration in it entirety. This parameter can for backward
 *    compatibility also contain a padding value. A padding value only overrides the global padding, not the
 *    entire global configuration.
 * @param {number} defaultPadding - Padding used if no padding is specified in neither the configuration nor
 *    explicitly to the API method.
 * @returns {ParsedConfiguration}
 */
function getConfiguration(paddingOrLocalConfig, defaultPadding) {
    var configObject =
            typeof paddingOrLocalConfig == "object" && paddingOrLocalConfig ||
            rootConfigurationHolder[CONFIG_PROPERTIES.n/*MODULE*/] ||
            GLOBAL[CONFIG_PROPERTIES.G/*GLOBAL*/] ||
            { },

        lightnessConfig = configObject["lightness"] || { },

        // In versions < 2.1.0 there was no grayscale saturation -
        // saturation was the color saturation.
        saturation = configObject["saturation"] || { },
        colorSaturation = "color" in saturation ? saturation["color"] : saturation,
        grayscaleSaturation = saturation["grayscale"],

        backColor = configObject["backColor"],
        padding = configObject["padding"];

    /**
     * Creates a lightness range.
     */
    function lightness(configName, defaultRange) {
        var range = lightnessConfig[configName];

        // Check if the lightness range is an array-like object. This way we ensure the
        // array contain two values at the same time.
        if (!(range && range.length > 1)) {
            range = defaultRange;
        }

        /**
         * Gets a lightness relative the specified value in the specified lightness range.
         */
        return function (value) {
            value = range[0] + value * (range[1] - range[0]);
            return value < 0 ? 0 : value > 1 ? 1 : value;
        };
    }

    /**
     * Gets a hue allowed by the configured hue restriction,
     * provided the originally computed hue.
     */
    function hueFunction(originalHue) {
        var hueConfig = configObject["hues"];
        var hue;

        // Check if 'hues' is an array-like object. This way we also ensure that
        // the array is not empty, which would mean no hue restriction.
        if (hueConfig && hueConfig.length > 0) {
            // originalHue is in the range [0, 1]
            // Multiply with 0.999 to change the range to [0, 1) and then truncate the index.
            hue = hueConfig[0 | (0.999 * originalHue * hueConfig.length)];
        }

        return typeof hue == "number" ?

            // A hue was specified. We need to convert the hue from
            // degrees on any turn - e.g. 746° is a perfectly valid hue -
            // to turns in the range [0, 1).
            ((((hue / 360) % 1) + 1) % 1) :

            // No hue configured => use original hue
            originalHue;
    }

    return {
        X/*hue*/: hueFunction,
        p/*colorSaturation*/: typeof colorSaturation == "number" ? colorSaturation : 0.5,
        H/*grayscaleSaturation*/: typeof grayscaleSaturation == "number" ? grayscaleSaturation : 0,
        q/*colorLightness*/: lightness("color", [0.4, 0.8]),
        I/*grayscaleLightness*/: lightness("grayscale", [0.3, 0.9]),
        J/*backColor*/: parseColor(backColor),
        Y/*iconPadding*/:
            typeof paddingOrLocalConfig == "number" ? paddingOrLocalConfig :
            typeof padding == "number" ? padding :
            defaultPadding
    }
}

var ICON_TYPE_SVG = 1;

var ICON_TYPE_CANVAS = 2;

var ATTRIBUTES = {
    t/*HASH*/: "data-jdenticon-hash",
    o/*VALUE*/: "data-jdenticon-value"
};

var IS_RENDERED_PROPERTY = "jdenticonRendered";

var ICON_SELECTOR = "[" + ATTRIBUTES.t/*HASH*/ +"],[" + ATTRIBUTES.o/*VALUE*/ +"]";

var documentQuerySelectorAll = /** @type {!Function} */ (
    typeof document !== "undefined" && document.querySelectorAll.bind(document));

function getIdenticonType(el) {
    if (el) {
        var tagName = el["tagName"];

        if (/^svg$/i.test(tagName)) {
            return ICON_TYPE_SVG;
        }

        if (/^canvas$/i.test(tagName) && "getContext" in el) {
            return ICON_TYPE_CANVAS;
        }
    }
}

function whenDocumentIsReady(/** @type {Function} */ callback) {
    function loadedHandler() {
        document.removeEventListener("DOMContentLoaded", loadedHandler);
        window.removeEventListener("load", loadedHandler);
        setTimeout(callback, 0); // Give scripts a chance to run
    }

    if (typeof document !== "undefined" &&
        typeof window !== "undefined" &&
        typeof setTimeout !== "undefined"
    ) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", loadedHandler);
            window.addEventListener("load", loadedHandler);
        } else {
            // Document already loaded. The load events above likely won't be raised
            setTimeout(callback, 0);
        }
    }
}

function observer(updateCallback) {
    if (typeof MutationObserver != "undefined") {
        var mutationObserver = new MutationObserver(function onmutation(mutations) {
            for (var mutationIndex = 0; mutationIndex < mutations.length; mutationIndex++) {
                var mutation = mutations[mutationIndex];
                var addedNodes = mutation.addedNodes;

                for (var addedNodeIndex = 0; addedNodes && addedNodeIndex < addedNodes.length; addedNodeIndex++) {
                    var addedNode = addedNodes[addedNodeIndex];

                    // Skip other types of nodes than element nodes, since they might not support
                    // the querySelectorAll method => runtime error.
                    if (addedNode.nodeType == 1) {
                        if (getIdenticonType(addedNode)) {
                            updateCallback(addedNode);
                        }
                        else {
                            var icons = /** @type {Element} */(addedNode).querySelectorAll(ICON_SELECTOR);
                            for (var iconIndex = 0; iconIndex < icons.length; iconIndex++) {
                                updateCallback(icons[iconIndex]);
                            }
                        }
                    }
                }

                if (mutation.type == "attributes" && getIdenticonType(mutation.target)) {
                    updateCallback(mutation.target);
                }
            }
        });

        mutationObserver.observe(document.body, {
            "childList": true,
            "attributes": true,
            "attributeFilter": [ATTRIBUTES.o/*VALUE*/, ATTRIBUTES.t/*HASH*/, "width", "height"],
            "subtree": true,
        });
    }
}

/**
 * Represents a point.
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Translates and rotates a point before being passed on to the canvas context. This was previously done by the canvas context itself,
 * but this caused a rendering issue in Chrome on sizes > 256 where the rotation transformation of inverted paths was not done properly.
 */
function Transform(x, y, size, rotation) {
    this.u/*_x*/ = x;
    this.v/*_y*/ = y;
    this.K/*_size*/ = size;
    this.Z/*_rotation*/ = rotation;
}

/**
 * Transforms the specified point based on the translation and rotation specification for this Transform.
 * @param {number} x x-coordinate
 * @param {number} y y-coordinate
 * @param {number=} w The width of the transformed rectangle. If greater than 0, this will ensure the returned point is of the upper left corner of the transformed rectangle.
 * @param {number=} h The height of the transformed rectangle. If greater than 0, this will ensure the returned point is of the upper left corner of the transformed rectangle.
 */
Transform.prototype.L/*transformIconPoint*/ = function transformIconPoint (x, y, w, h) {
    var right = this.u/*_x*/ + this.K/*_size*/,
          bottom = this.v/*_y*/ + this.K/*_size*/,
          rotation = this.Z/*_rotation*/;
    return rotation === 1 ? new Point(right - y - (h || 0), this.v/*_y*/ + x) :
           rotation === 2 ? new Point(right - x - (w || 0), bottom - y - (h || 0)) :
           rotation === 3 ? new Point(this.u/*_x*/ + y, bottom - x - (w || 0)) :
           new Point(this.u/*_x*/ + x, this.v/*_y*/ + y);
};

var NO_TRANSFORM = new Transform(0, 0, 0, 0);



/**
 * Provides helper functions for rendering common basic shapes.
 */
function Graphics(renderer) {
    /**
     * @type {Renderer}
     * @private
     */
    this.M/*_renderer*/ = renderer;

    /**
     * @type {Transform}
     */
    this.A/*currentTransform*/ = NO_TRANSFORM;
}
var Graphics__prototype = Graphics.prototype;

/**
 * Adds a polygon to the underlying renderer.
 * @param {Array<number>} points The points of the polygon clockwise on the format [ x0, y0, x1, y1, ..., xn, yn ]
 * @param {boolean=} invert Specifies if the polygon will be inverted.
 */
Graphics__prototype.g/*addPolygon*/ = function addPolygon (points, invert) {
        var this$1 = this;

    var di = invert ? -2 : 2,
          transformedPoints = [];

    for (var i = invert ? points.length - 2 : 0; i < points.length && i >= 0; i += di) {
        transformedPoints.push(this$1.A/*currentTransform*/.L/*transformIconPoint*/(points[i], points[i + 1]));
    }

    this.M/*_renderer*/.g/*addPolygon*/(transformedPoints);
};

/**
 * Adds a polygon to the underlying renderer.
 * Source: http://stackoverflow.com/a/2173084
 * @param {number} x The x-coordinate of the upper left corner of the rectangle holding the entire ellipse.
 * @param {number} y The y-coordinate of the upper left corner of the rectangle holding the entire ellipse.
 * @param {number} size The size of the ellipse.
 * @param {boolean=} invert Specifies if the ellipse will be inverted.
 */
Graphics__prototype.h/*addCircle*/ = function addCircle (x, y, size, invert) {
    var p = this.A/*currentTransform*/.L/*transformIconPoint*/(x, y, size, size);
    this.M/*_renderer*/.h/*addCircle*/(p, size, invert);
};

/**
 * Adds a rectangle to the underlying renderer.
 * @param {number} x The x-coordinate of the upper left corner of the rectangle.
 * @param {number} y The y-coordinate of the upper left corner of the rectangle.
 * @param {number} w The width of the rectangle.
 * @param {number} h The height of the rectangle.
 * @param {boolean=} invert Specifies if the rectangle will be inverted.
 */
Graphics__prototype.i/*addRectangle*/ = function addRectangle (x, y, w, h, invert) {
    this.g/*addPolygon*/([
        x, y,
        x + w, y,
        x + w, y + h,
        x, y + h
    ], invert);
};

/**
 * Adds a right triangle to the underlying renderer.
 * @param {number} x The x-coordinate of the upper left corner of the rectangle holding the triangle.
 * @param {number} y The y-coordinate of the upper left corner of the rectangle holding the triangle.
 * @param {number} w The width of the triangle.
 * @param {number} h The height of the triangle.
 * @param {number} r The rotation of the triangle (clockwise). 0 = right corner of the triangle in the lower left corner of the bounding rectangle.
 * @param {boolean=} invert Specifies if the triangle will be inverted.
 */
Graphics__prototype.j/*addTriangle*/ = function addTriangle (x, y, w, h, r, invert) {
    var points = [
        x + w, y,
        x + w, y + h,
        x, y + h,
        x, y
    ];
    points.splice(((r || 0) % 4) * 2, 2);
    this.g/*addPolygon*/(points, invert);
};

/**
 * Adds a rhombus to the underlying renderer.
 * @param {number} x The x-coordinate of the upper left corner of the rectangle holding the rhombus.
 * @param {number} y The y-coordinate of the upper left corner of the rectangle holding the rhombus.
 * @param {number} w The width of the rhombus.
 * @param {number} h The height of the rhombus.
 * @param {boolean=} invert Specifies if the rhombus will be inverted.
 */
Graphics__prototype.N/*addRhombus*/ = function addRhombus (x, y, w, h, invert) {
    this.g/*addPolygon*/([
        x + w / 2, y,
        x + w, y + h / 2,
        x + w / 2, y + h,
        x, y + h / 2
    ], invert);
};

/**
 * @param {number} index
 * @param {Graphics} g
 * @param {number} cell
 * @param {number} positionIndex
 */
function centerShape(index, g, cell, positionIndex) {
    index = index % 14;

    var k, m, w, h, inner, outer;

    !index ? (
        k = cell * 0.42,
        g.g/*addPolygon*/([
            0, 0,
            cell, 0,
            cell, cell - k * 2,
            cell - k, cell,
            0, cell
        ])) :

    index == 1 ? (
        w = 0 | (cell * 0.5),
        h = 0 | (cell * 0.8),

        g.j/*addTriangle*/(cell - w, 0, w, h, 2)) :

    index == 2 ? (
        w = 0 | (cell / 3),
        g.i/*addRectangle*/(w, w, cell - w, cell - w)) :

    index == 3 ? (
        inner = cell * 0.1,
        // Use fixed outer border widths in small icons to ensure the border is drawn
        outer =
            cell < 6 ? 1 :
            cell < 8 ? 2 :
            (0 | (cell * 0.25)),

        inner =
            inner > 1 ? (0 | inner) : // large icon => truncate decimals
            inner > 0.5 ? 1 :         // medium size icon => fixed width
            inner,                    // small icon => anti-aliased border

        g.i/*addRectangle*/(outer, outer, cell - inner - outer, cell - inner - outer)) :

    index == 4 ? (
        m = 0 | (cell * 0.15),
        w = 0 | (cell * 0.5),
        g.h/*addCircle*/(cell - w - m, cell - w - m, w)) :

    index == 5 ? (
        inner = cell * 0.1,
        outer = inner * 4,

        // Align edge to nearest pixel in large icons
        outer > 3 && (outer = 0 | outer),

        g.i/*addRectangle*/(0, 0, cell, cell),
        g.g/*addPolygon*/([
            outer, outer,
            cell - inner, outer,
            outer + (cell - outer - inner) / 2, cell - inner
        ], true)) :

    index == 6 ?
        g.g/*addPolygon*/([
            0, 0,
            cell, 0,
            cell, cell * 0.7,
            cell * 0.4, cell * 0.4,
            cell * 0.7, cell,
            0, cell
        ]) :

    index == 7 ?
        g.j/*addTriangle*/(cell / 2, cell / 2, cell / 2, cell / 2, 3) :

    index == 8 ? (
        g.i/*addRectangle*/(0, 0, cell, cell / 2),
        g.i/*addRectangle*/(0, cell / 2, cell / 2, cell / 2),
        g.j/*addTriangle*/(cell / 2, cell / 2, cell / 2, cell / 2, 1)) :

    index == 9 ? (
        inner = cell * 0.14,
        // Use fixed outer border widths in small icons to ensure the border is drawn
        outer =
            cell < 4 ? 1 :
            cell < 6 ? 2 :
            (0 | (cell * 0.35)),

        inner =
            cell < 8 ? inner : // small icon => anti-aliased border
            (0 | inner),       // large icon => truncate decimals

        g.i/*addRectangle*/(0, 0, cell, cell),
        g.i/*addRectangle*/(outer, outer, cell - outer - inner, cell - outer - inner, true)) :

    index == 10 ? (
        inner = cell * 0.12,
        outer = inner * 3,

        g.i/*addRectangle*/(0, 0, cell, cell),
        g.h/*addCircle*/(outer, outer, cell - inner - outer, true)) :

    index == 11 ?
        g.j/*addTriangle*/(cell / 2, cell / 2, cell / 2, cell / 2, 3) :

    index == 12 ? (
        m = cell * 0.25,
        g.i/*addRectangle*/(0, 0, cell, cell),
        g.N/*addRhombus*/(m, m, cell - m, cell - m, true)) :

    // 13
    (
        !positionIndex && (
            m = cell * 0.4, w = cell * 1.2,
            g.h/*addCircle*/(m, m, w)
        )
    );
}

/**
 * @param {number} index
 * @param {Graphics} g
 * @param {number} cell
 */
function outerShape(index, g, cell) {
    index = index % 4;

    var m;

    !index ?
        g.j/*addTriangle*/(0, 0, cell, cell, 0) :

    index == 1 ?
        g.j/*addTriangle*/(0, cell / 2, cell, cell / 2, 0) :

    index == 2 ?
        g.N/*addRhombus*/(0, 0, cell, cell) :

    // 3
    (
        m = cell / 6,
        g.h/*addCircle*/(m, m, cell - 2 * m)
    );
}

/**
 * Gets a set of identicon color candidates for a specified hue and config.
 * @param {number} hue
 * @param {ParsedConfiguration} config
 */
function colorTheme(hue, config) {
    hue = config.X/*hue*/(hue);
    return [
        // Dark gray
        correctedHsl(hue, config.H/*grayscaleSaturation*/, config.I/*grayscaleLightness*/(0)),
        // Mid color
        correctedHsl(hue, config.p/*colorSaturation*/, config.q/*colorLightness*/(0.5)),
        // Light gray
        correctedHsl(hue, config.H/*grayscaleSaturation*/, config.I/*grayscaleLightness*/(1)),
        // Light color
        correctedHsl(hue, config.p/*colorSaturation*/, config.q/*colorLightness*/(1)),
        // Dark color
        correctedHsl(hue, config.p/*colorSaturation*/, config.q/*colorLightness*/(0))
    ];
}

/**
 * Draws an identicon to a specified renderer.
 * @param {Renderer} renderer
 * @param {string} hash
 * @param {Object|number=} config
 */
function iconGenerator(renderer, hash, config) {
    var parsedConfig = getConfiguration(config, 0.08);

    // Set background color
    if (parsedConfig.J/*backColor*/) {
        renderer.m/*setBackground*/(parsedConfig.J/*backColor*/);
    }

    // Calculate padding and round to nearest integer
    var size = renderer.k/*iconSize*/;
    var padding = (0.5 + size * parsedConfig.Y/*iconPadding*/) | 0;
    size -= padding * 2;

    var graphics = new Graphics(renderer);

    // Calculate cell size and ensure it is an integer
    var cell = 0 | (size / 4);

    // Since the cell size is integer based, the actual icon will be slightly smaller than specified => center icon
    var x = 0 | (padding + size / 2 - cell * 2);
    var y = 0 | (padding + size / 2 - cell * 2);

    function renderShape(colorIndex, shapes, index, rotationIndex, positions) {
        var shapeIndex = parseHex(hash, index, 1);
        var r = rotationIndex ? parseHex(hash, rotationIndex, 1) : 0;

        renderer.O/*beginShape*/(availableColors[selectedColorIndexes[colorIndex]]);

        for (var i = 0; i < positions.length; i++) {
            graphics.A/*currentTransform*/ = new Transform(x + positions[i][0] * cell, y + positions[i][1] * cell, cell, r++ % 4);
            shapes(shapeIndex, graphics, cell, i);
        }

        renderer.P/*endShape*/();
    }

    // AVAILABLE COLORS
    var hue = parseHex(hash, -7) / 0xfffffff,

          // Available colors for this icon
          availableColors = colorTheme(hue, parsedConfig),

          // The index of the selected colors
          selectedColorIndexes = [];

    var index;

    function isDuplicate(values) {
        if (values.indexOf(index) >= 0) {
            for (var i = 0; i < values.length; i++) {
                if (selectedColorIndexes.indexOf(values[i]) >= 0) {
                    return true;
                }
            }
        }
    }

    for (var i = 0; i < 3; i++) {
        index = parseHex(hash, 8 + i, 1) % availableColors.length;
        if (isDuplicate([0, 4]) || // Disallow dark gray and dark color combo
            isDuplicate([2, 3])) { // Disallow light gray and light color combo
            index = 1;
        }
        selectedColorIndexes.push(index);
    }

    // ACTUAL RENDERING
    // Sides
    renderShape(0, outerShape, 2, 3, [[1, 0], [2, 0], [2, 3], [1, 3], [0, 1], [3, 1], [3, 2], [0, 2]]);
    // Corners
    renderShape(1, outerShape, 4, 5, [[0, 0], [3, 0], [3, 3], [0, 3]]);
    // Center
    renderShape(2, centerShape, 1, null, [[1, 1], [2, 1], [2, 2], [1, 2]]);

    renderer.finish();
}

/**
 * Computes a SHA1 hash for any value and returns it as a hexadecimal string.
 *
 * This function is optimized for minimal code size and rather short messages.
 *
 * @param {string} message
 */
function sha1(message) {
    var HASH_SIZE_HALF_BYTES = 40;
    var BLOCK_SIZE_WORDS = 16;

    // Variables
    // `var` is used to be able to minimize the number of `var` keywords.
    var i = 0,
        f = 0,

        // Use `encodeURI` to UTF8 encode the message without any additional libraries
        // We could use `unescape` + `encodeURI` to minimize the code, but that would be slightly risky
        // since `unescape` is deprecated.
        urlEncodedMessage = encodeURI(message) + "%80", // trailing '1' bit padding

        // This can be changed to a preallocated Uint32Array array for greater performance and larger code size
        data = [],
        dataSize,

        hashBuffer = [],

        a = 0x67452301,
        b = 0xefcdab89,
        c = ~a,
        d = ~b,
        e = 0xc3d2e1f0,
        hash = [a, b, c, d, e],

        blockStartIndex = 0,
        hexHash = "";

    /**
     * Rotates the value a specified number of bits to the left.
     * @param {number} value  Value to rotate
     * @param {number} shift  Bit count to shift.
     */
    function rotl(value, shift) {
        return (value << shift) | (value >>> (32 - shift));
    }

    // Message data
    for ( ; i < urlEncodedMessage.length; f++) {
        data[f >> 2] = data[f >> 2] |
            (
                (
                    urlEncodedMessage[i] == "%"
                        // Percent encoded byte
                        ? parseInt(urlEncodedMessage.substring(i + 1, i += 3), 16)
                        // Unencoded byte
                        : urlEncodedMessage.charCodeAt(i++)
                )

                // Read bytes in reverse order (big endian words)
                << ((3 - (f & 3)) * 8)
            );
    }

    // f is now the length of the utf8 encoded message
    // 7 = 8 bytes (64 bit) for message size, -1 to round down
    // >> 6 = integer division with block size
    dataSize = (((f + 7) >> 6) + 1) * BLOCK_SIZE_WORDS;

    // Message size in bits.
    // SHA1 uses a 64 bit integer to represent the size, but since we only support short messages only the least
    // significant 32 bits are set. -8 is for the '1' bit padding byte.
    data[dataSize - 1] = f * 8 - 8;

    // Compute hash
    for ( ; blockStartIndex < dataSize; blockStartIndex += BLOCK_SIZE_WORDS) {
        for (i = 0; i < 80; i++) {
            f = rotl(a, 5) + e + (
                    // Ch
                    i < 20 ? ((b & c) ^ ((~b) & d)) + 0x5a827999 :

                    // Parity
                    i < 40 ? (b ^ c ^ d) + 0x6ed9eba1 :

                    // Maj
                    i < 60 ? ((b & c) ^ (b & d) ^ (c & d)) + 0x8f1bbcdc :

                    // Parity
                    (b ^ c ^ d) + 0xca62c1d6
                ) + (
                    hashBuffer[i] = i < BLOCK_SIZE_WORDS
                        // Bitwise OR is used to coerse `undefined` to 0
                        ? (data[blockStartIndex + i] | 0)
                        : rotl(hashBuffer[i - 3] ^ hashBuffer[i - 8] ^ hashBuffer[i - 14] ^ hashBuffer[i - 16], 1)
                );

            e = d;
            d = c;
            c = rotl(b, 30);
            b = a;
            a = f;
        }

        hash[0] = a = ((hash[0] + a) | 0);
        hash[1] = b = ((hash[1] + b) | 0);
        hash[2] = c = ((hash[2] + c) | 0);
        hash[3] = d = ((hash[3] + d) | 0);
        hash[4] = e = ((hash[4] + e) | 0);
    }

    // Format hex hash
    for (i = 0; i < HASH_SIZE_HALF_BYTES; i++) {
        hexHash += (
            (
                // Get word (2^3 half-bytes per word)
                hash[i >> 3] >>>

                // Append half-bytes in reverse order
                ((7 - (i & 7)) * 4)
            )
            // Clamp to half-byte
            & 0xf
        ).toString(16);
    }

    return hexHash;
}

/**
 * Inputs a value that might be a valid hash string for Jdenticon and returns it
 * if it is determined valid, otherwise a falsy value is returned.
 */
function isValidHash(hashCandidate) {
    return /^[0-9a-f]{11,}$/i.test(hashCandidate) && hashCandidate;
}

/**
 * Computes a hash for the specified value. Currently SHA1 is used. This function
 * always returns a valid hash.
 */
function computeHash(value) {
    return sha1(value == null ? "" : "" + value);
}



/**
 * Renderer redirecting drawing commands to a canvas context.
 * @implements {Renderer}
 */
function CanvasRenderer(ctx, iconSize) {
    var canvas = ctx.canvas;
    var width = canvas.width;
    var height = canvas.height;

    ctx.save();

    if (!iconSize) {
        iconSize = Math.min(width, height);

        ctx.translate(
            ((width - iconSize) / 2) | 0,
            ((height - iconSize) / 2) | 0);
    }

    /**
     * @private
     */
    this.l/*_ctx*/ = ctx;
    this.k/*iconSize*/ = iconSize;

    ctx.clearRect(0, 0, iconSize, iconSize);
}
var CanvasRenderer__prototype = CanvasRenderer.prototype;

/**
 * Fills the background with the specified color.
 * @param {string} fillColor  Fill color on the format #rrggbb[aa].
 */
CanvasRenderer__prototype.m/*setBackground*/ = function setBackground (fillColor) {
    var ctx = this.l/*_ctx*/;
    var iconSize = this.k/*iconSize*/;

    ctx.fillStyle = toCss3Color(fillColor);
    ctx.fillRect(0, 0, iconSize, iconSize);
};

/**
 * Marks the beginning of a new shape of the specified color. Should be ended with a call to endShape.
 * @param {string} fillColor Fill color on format #rrggbb[aa].
 */
CanvasRenderer__prototype.O/*beginShape*/ = function beginShape (fillColor) {
    var ctx = this.l/*_ctx*/;
    ctx.fillStyle = toCss3Color(fillColor);
    ctx.beginPath();
};

/**
 * Marks the end of the currently drawn shape. This causes the queued paths to be rendered on the canvas.
 */
CanvasRenderer__prototype.P/*endShape*/ = function endShape () {
    this.l/*_ctx*/.fill();
};

/**
 * Adds a polygon to the rendering queue.
 * @param points An array of Point objects.
 */
CanvasRenderer__prototype.g/*addPolygon*/ = function addPolygon (points) {
    var ctx = this.l/*_ctx*/;
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
};

/**
 * Adds a circle to the rendering queue.
 * @param {Point} point The upper left corner of the circle bounding box.
 * @param {number} diameter The diameter of the circle.
 * @param {boolean} counterClockwise True if the circle is drawn counter-clockwise (will result in a hole if rendered on a clockwise path).
 */
CanvasRenderer__prototype.h/*addCircle*/ = function addCircle (point, diameter, counterClockwise) {
    var ctx = this.l/*_ctx*/,
          radius = diameter / 2;
    ctx.moveTo(point.x + radius, point.y + radius);
    ctx.arc(point.x + radius, point.y + radius, radius, 0, Math.PI * 2, counterClockwise);
    ctx.closePath();
};

/**
 * Called when the icon has been completely drawn.
 */
CanvasRenderer__prototype.finish = function finish () {
    this.l/*_ctx*/.restore();
};

/**
 * Draws an identicon to a context.
 * @param {CanvasRenderingContext2D} ctx - Canvas context on which the icon will be drawn at location (0, 0).
 * @param {*} hashOrValue - A hexadecimal hash string or any value that will be hashed by Jdenticon.
 * @param {number} size - Icon size in pixels.
 * @param {Object|number=} config - Optional configuration. If specified, this configuration object overrides any
 *    global configuration in its entirety. For backward compatibility a padding value in the range [0.0, 0.5) can be
 *    specified in place of a configuration object.
 */
function drawIcon(ctx, hashOrValue, size, config) {
    if (!ctx) {
        throw new Error("No canvas specified.");
    }

    iconGenerator(new CanvasRenderer(ctx, size),
        isValidHash(hashOrValue) || computeHash(hashOrValue),
        config);

    var canvas = ctx.canvas;
    if (canvas) {
        canvas[IS_RENDERED_PROPERTY] = true;
    }
}

/**
 * Prepares a measure to be used as a measure in an SVG path, by
 * rounding the measure to a single decimal. This reduces the file
 * size of the generated SVG with more than 50% in some cases.
 */
function svgValue(value) {
    return ((value * 10 + 0.5) | 0) / 10;
}

/**
 * Represents an SVG path element.
 */
function SvgPath() {
    /**
     * This property holds the data string (path.d) of the SVG path.
     * @type {string}
     */
    this.B/*dataString*/ = "";
}
var SvgPath__prototype = SvgPath.prototype;

/**
 * Adds a polygon with the current fill color to the SVG path.
 * @param points An array of Point objects.
 */
SvgPath__prototype.g/*addPolygon*/ = function addPolygon (points) {
    var dataString = "";
    for (var i = 0; i < points.length; i++) {
        dataString += (i ? "L" : "M") + svgValue(points[i].x) + " " + svgValue(points[i].y);
    }
    this.B/*dataString*/ += dataString + "Z";
};

/**
 * Adds a circle with the current fill color to the SVG path.
 * @param {Point} point The upper left corner of the circle bounding box.
 * @param {number} diameter The diameter of the circle.
 * @param {boolean} counterClockwise True if the circle is drawn counter-clockwise (will result in a hole if rendered on a clockwise path).
 */
SvgPath__prototype.h/*addCircle*/ = function addCircle (point, diameter, counterClockwise) {
    var sweepFlag = counterClockwise ? 0 : 1,
          svgRadius = svgValue(diameter / 2),
          svgDiameter = svgValue(diameter),
          svgArc = "a" + svgRadius + "," + svgRadius + " 0 1," + sweepFlag + " ";

    this.B/*dataString*/ +=
        "M" + svgValue(point.x) + " " + svgValue(point.y + diameter / 2) +
        svgArc + svgDiameter + ",0" +
        svgArc + (-svgDiameter) + ",0";
};



/**
 * Renderer producing SVG output.
 * @implements {Renderer}
 */
function SvgRenderer(target) {
    /**
     * @type {SvgPath}
     * @private
     */
    this.C/*_path*/;

    /**
     * @type {Object.<string,SvgPath>}
     * @private
     */
    this.D/*_pathsByColor*/ = { };

    /**
     * @type {SvgElement|SvgWriter}
     * @private
     */
    this.R/*_target*/ = target;

    /**
     * @type {number}
     */
    this.k/*iconSize*/ = target.k/*iconSize*/;
}
var SvgRenderer__prototype = SvgRenderer.prototype;

/**
 * Fills the background with the specified color.
 * @param {string} fillColor  Fill color on the format #rrggbb[aa].
 */
SvgRenderer__prototype.m/*setBackground*/ = function setBackground (fillColor) {
    var match = /^(#......)(..)?/.exec(fillColor),
          opacity = match[2] ? parseHex(match[2], 0) / 255 : 1;
    this.R/*_target*/.m/*setBackground*/(match[1], opacity);
};

/**
 * Marks the beginning of a new shape of the specified color. Should be ended with a call to endShape.
 * @param {string} color Fill color on format #xxxxxx.
 */
SvgRenderer__prototype.O/*beginShape*/ = function beginShape (color) {
    this.C/*_path*/ = this.D/*_pathsByColor*/[color] || (this.D/*_pathsByColor*/[color] = new SvgPath());
};

/**
 * Marks the end of the currently drawn shape.
 */
SvgRenderer__prototype.P/*endShape*/ = function endShape () { };

/**
 * Adds a polygon with the current fill color to the SVG.
 * @param points An array of Point objects.
 */
SvgRenderer__prototype.g/*addPolygon*/ = function addPolygon (points) {
    this.C/*_path*/.g/*addPolygon*/(points);
};

/**
 * Adds a circle with the current fill color to the SVG.
 * @param {Point} point The upper left corner of the circle bounding box.
 * @param {number} diameter The diameter of the circle.
 * @param {boolean} counterClockwise True if the circle is drawn counter-clockwise (will result in a hole if rendered on a clockwise path).
 */
SvgRenderer__prototype.h/*addCircle*/ = function addCircle (point, diameter, counterClockwise) {
    this.C/*_path*/.h/*addCircle*/(point, diameter, counterClockwise);
};

/**
 * Called when the icon has been completely drawn.
 */
SvgRenderer__prototype.finish = function finish () {
        var this$1 = this;

    var pathsByColor = this.D/*_pathsByColor*/;
    for (var color in pathsByColor) {
        // hasOwnProperty cannot be shadowed in pathsByColor
        // eslint-disable-next-line no-prototype-builtins
        if (pathsByColor.hasOwnProperty(color)) {
            this$1.R/*_target*/.S/*appendPath*/(color, pathsByColor[color].B/*dataString*/);
        }
    }
};

var SVG_CONSTANTS = {
    T/*XMLNS*/: "http://www.w3.org/2000/svg",
    U/*WIDTH*/: "width",
    V/*HEIGHT*/: "height",
};

/**
 * Renderer producing SVG output.
 */
function SvgWriter(iconSize) {
    /**
     * @type {number}
     */
    this.k/*iconSize*/ = iconSize;

    /**
     * @type {string}
     * @private
     */
    this.F/*_s*/ =
        '<svg xmlns="' + SVG_CONSTANTS.T/*XMLNS*/ + '" width="' +
        iconSize + '" height="' + iconSize + '" viewBox="0 0 ' +
        iconSize + ' ' + iconSize + '">';
}
var SvgWriter__prototype = SvgWriter.prototype;

/**
 * Fills the background with the specified color.
 * @param {string} fillColor  Fill color on the format #rrggbb.
 * @param {number} opacity  Opacity in the range [0.0, 1.0].
 */
SvgWriter__prototype.m/*setBackground*/ = function setBackground (fillColor, opacity) {
    if (opacity) {
        this.F/*_s*/ += '<rect width="100%" height="100%" fill="' +
            fillColor + '" opacity="' + opacity.toFixed(2) + '"/>';
    }
};

/**
 * Writes a path to the SVG string.
 * @param {string} color Fill color on format #rrggbb.
 * @param {string} dataString The SVG path data string.
 */
SvgWriter__prototype.S/*appendPath*/ = function appendPath (color, dataString) {
    this.F/*_s*/ += '<path fill="' + color + '" d="' + dataString + '"/>';
};

/**
 * Gets the rendered image as an SVG string.
 */
SvgWriter__prototype.toString = function toString () {
    return this.F/*_s*/ + "</svg>";
};

/**
 * Draws an identicon as an SVG string.
 * @param {*} hashOrValue - A hexadecimal hash string or any value that will be hashed by Jdenticon.
 * @param {number} size - Icon size in pixels.
 * @param {Object|number=} config - Optional configuration. If specified, this configuration object overrides any
 *    global configuration in its entirety. For backward compatibility a padding value in the range [0.0, 0.5) can be
 *    specified in place of a configuration object.
 * @returns {string} SVG string
 */
function toSvg(hashOrValue, size, config) {
    var writer = new SvgWriter(size);
    iconGenerator(new SvgRenderer(writer),
        isValidHash(hashOrValue) || computeHash(hashOrValue),
        config);
    return writer.toString();
}

/**
 * Creates a new element and adds it to the specified parent.
 * @param {Element} parentNode
 * @param {string} name
 * @param {...(string|number)} keyValuePairs
 */
function SvgElement_append(parentNode, name) {
    var keyValuePairs = [], len = arguments.length - 2;
    while ( len-- > 0 ) keyValuePairs[ len ] = arguments[ len + 2 ];

    var el = document.createElementNS(SVG_CONSTANTS.T/*XMLNS*/, name);

    for (var i = 0; i + 1 < keyValuePairs.length; i += 2) {
        el.setAttribute(
            /** @type {string} */(keyValuePairs[i]),
            /** @type {string} */(keyValuePairs[i + 1])
            );
    }

    parentNode.appendChild(el);
}


/**
 * Renderer producing SVG output.
 */
function SvgElement(element) {
    // Don't use the clientWidth and clientHeight properties on SVG elements
    // since Firefox won't serve a proper value of these properties on SVG
    // elements (https://bugzilla.mozilla.org/show_bug.cgi?id=874811)
    // Instead use 100px as a hardcoded size (the svg viewBox will rescale
    // the icon to the correct dimensions)
    var iconSize = this.k/*iconSize*/ = Math.min(
        (Number(element.getAttribute(SVG_CONSTANTS.U/*WIDTH*/)) || 100),
        (Number(element.getAttribute(SVG_CONSTANTS.V/*HEIGHT*/)) || 100)
        );

    /**
     * @type {Element}
     * @private
     */
    this.W/*_el*/ = element;

    // Clear current SVG child elements
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    // Set viewBox attribute to ensure the svg scales nicely.
    element.setAttribute("viewBox", "0 0 " + iconSize + " " + iconSize);
    element.setAttribute("preserveAspectRatio", "xMidYMid meet");
}
var SvgElement__prototype = SvgElement.prototype;

/**
 * Fills the background with the specified color.
 * @param {string} fillColor  Fill color on the format #rrggbb.
 * @param {number} opacity  Opacity in the range [0.0, 1.0].
 */
SvgElement__prototype.m/*setBackground*/ = function setBackground (fillColor, opacity) {
    if (opacity) {
        SvgElement_append(this.W/*_el*/, "rect",
            SVG_CONSTANTS.U/*WIDTH*/, "100%",
            SVG_CONSTANTS.V/*HEIGHT*/, "100%",
            "fill", fillColor,
            "opacity", opacity);
    }
};

/**
 * Appends a path to the SVG element.
 * @param {string} color Fill color on format #xxxxxx.
 * @param {string} dataString The SVG path data string.
 */
SvgElement__prototype.S/*appendPath*/ = function appendPath (color, dataString) {
    SvgElement_append(this.W/*_el*/, "path",
        "fill", color,
        "d", dataString);
};

/**
 * Updates all canvas elements with the `data-jdenticon-hash` or `data-jdenticon-value` attribute.
 */
function updateAll() {
    if (documentQuerySelectorAll) {
        update(ICON_SELECTOR);
    }
}

/**
 * Updates all canvas elements with the `data-jdenticon-hash` or `data-jdenticon-value` attribute that have not already
 * been rendered.
 */
function updateAllConditional() {
    if (documentQuerySelectorAll) {
        /** @type {NodeListOf<HTMLElement>} */
        var elements = documentQuerySelectorAll(ICON_SELECTOR);

        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (!el[IS_RENDERED_PROPERTY]) {
                update(el);
            }
        }
    }
}

/**
 * Updates the identicon in the specified `<canvas>` or `<svg>` elements.
 * @param {(string|Element)} el - Specifies the container in which the icon is rendered as a DOM element of the type
 *    `<svg>` or `<canvas>`, or a CSS selector to such an element.
 * @param {*=} hashOrValue - Optional hash or value to be rendered. If not specified, the `data-jdenticon-hash` or
 *    `data-jdenticon-value` attribute will be evaluated.
 * @param {Object|number=} config - Optional configuration. If specified, this configuration object overrides any
 *    global configuration in its entirety. For backward compability a padding value in the range [0.0, 0.5) can be
 *    specified in place of a configuration object.
 */
function update(el, hashOrValue, config) {
    renderDomElement(el, hashOrValue, config, function (el, iconType) {
        if (iconType) {
            return iconType == ICON_TYPE_SVG ?
                new SvgRenderer(new SvgElement(el)) :
                new CanvasRenderer(/** @type {HTMLCanvasElement} */(el).getContext("2d"));
        }
    });
}

/**
 * Updates the identicon in the specified canvas or svg elements.
 * @param {(string|Element)} el - Specifies the container in which the icon is rendered as a DOM element of the type
 *    `<svg>` or `<canvas>`, or a CSS selector to such an element.
 * @param {*} hashOrValue - Optional hash or value to be rendered. If not specified, the `data-jdenticon-hash` or
 *    `data-jdenticon-value` attribute will be evaluated.
 * @param {Object|number|undefined} config
 * @param {function(Element,number):Renderer} rendererFactory - Factory function for creating an icon renderer.
 */
function renderDomElement(el, hashOrValue, config, rendererFactory) {
    if (typeof el === "string") {
        if (documentQuerySelectorAll) {
            var elements = documentQuerySelectorAll(el);
            for (var i = 0; i < elements.length; i++) {
                renderDomElement(elements[i], hashOrValue, config, rendererFactory);
            }
        }
        return;
    }

    // Hash selection. The result from getValidHash or computeHash is
    // accepted as a valid hash.
    var hash =
        // 1. Explicit valid hash
        isValidHash(hashOrValue) ||

        // 2. Explicit value (`!= null` catches both null and undefined)
        hashOrValue != null && computeHash(hashOrValue) ||

        // 3. `data-jdenticon-hash` attribute
        isValidHash(el.getAttribute(ATTRIBUTES.t/*HASH*/)) ||

        // 4. `data-jdenticon-value` attribute.
        // We want to treat an empty attribute as an empty value.
        // Some browsers return empty string even if the attribute
        // is not specified, so use hasAttribute to determine if
        // the attribute is specified.
        el.hasAttribute(ATTRIBUTES.o/*VALUE*/) && computeHash(el.getAttribute(ATTRIBUTES.o/*VALUE*/));

    if (!hash) {
        // No hash specified. Don't render an icon.
        return;
    }

    var renderer = rendererFactory(el, getIdenticonType(el));
    if (renderer) {
        // Draw icon
        iconGenerator(renderer, hash, config);
        el[IS_RENDERED_PROPERTY] = true;
    }
}

/**
 * Renders an identicon for all matching supported elements.
 *
 * @param {*} hashOrValue - A hexadecimal hash string or any value that will be hashed by Jdenticon. If not
 * specified the `data-jdenticon-hash` and `data-jdenticon-value` attributes of each element will be
 * evaluated.
 * @param {Object|number=} config - Optional configuration. If specified, this configuration object overrides any global
 * configuration in its entirety. For backward compatibility a padding value in the range [0.0, 0.5) can be
 * specified in place of a configuration object.
 */
function jdenticonJqueryPlugin(hashOrValue, config) {
    this["each"](function (index, el) {
        update(el, hashOrValue, config);
    });
    return this;
}

// This file is compiled to dist/jdenticon.js and dist/jdenticon.min.js

var jdenticon = updateAll;

defineConfigProperty(jdenticon);

// Export public API
jdenticon["configure"] = configure;
jdenticon["drawIcon"] = drawIcon;
jdenticon["toSvg"] = toSvg;
jdenticon["update"] = update;
jdenticon["updateCanvas"] = update;
jdenticon["updateSvg"] = update;

/**
 * Specifies the version of the Jdenticon package in use.
 * @type {string}
 */
jdenticon["version"] = "3.3.0";

/**
 * Specifies which bundle of Jdenticon that is used.
 * @type {string}
 */
jdenticon["bundle"] = "browser-umd";

// Basic jQuery plugin
var jQuery = GLOBAL["jQuery"];
if (jQuery) {
    jQuery["fn"]["jdenticon"] = jdenticonJqueryPlugin;
}

/**
 * This function is called once upon page load.
 */
function jdenticonStartup() {
    var replaceMode = (
        jdenticon[CONFIG_PROPERTIES.n/*MODULE*/] ||
        GLOBAL[CONFIG_PROPERTIES.G/*GLOBAL*/] ||
        { }
    )["replaceMode"];

    if (replaceMode != "never") {
        updateAllConditional();

        if (replaceMode == "observe") {
            observer(update);
        }
    }
}

// Schedule to render all identicons on the page once it has been loaded.
whenDocumentIsReady(jdenticonStartup);

return jdenticon;

});

