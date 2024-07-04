/*

This is a general manager for items

*/

const Items = {
    items: [],
}

Items.get = (curl) => {
    return Items.list.find(item => item.curl === curl)
}

Items.find_missing = () => {
    let used = Curls.get()
    let curls = used.filter(curl => !Items.list.find(item => item.curl === curl))
    let missing = []

    for (let curl of curls) {
        missing.push({curl: curl, status: `Not found`, updated: `0`, missing: true})
    }

    return missing
}

App.get_missing = () => {
    return Items.list.filter(item => item.missing)
}

Items.get_owned = () => {
    let picker_items = App.get_picker_items()

    return Items.list.filter(item => picker_items.find(
        picker => picker.curl === item.curl))
}

Items.get_by_date = (what) => {
    let cleaned = []
    let now = App.now()

    for (let item of Items.list) {
        let date = new Date(item.updated + `Z`)
        let diff = now - date

        if (diff < what) {
            cleaned.push(item)
        }
    }

    return cleaned
}

Items.get_today = () => {
    return Items.get_by_date(App.DAY)
}

Items.get_week = () => {
    return Items.get_by_date(App.WEEK)
}

Items.get_month = () => {
    return Items.get_by_date(App.MONTH)
}

Items.reset = () => {
    Items.items = []
}

Items.add_dates = () => {
    for (let item of Items.list) {
        let date = new Date(item.updated + `Z`)
        let date_mode = Container.get_date_mode()
        let s_date

        if (date_mode === `12`) {
            s_date = dateFormat(date, `dd/mmm/yy - h:MM tt`)
        }
        else if (date_mode === `24`) {
            s_date = dateFormat(date, `dd/mmm/yy - HH:MM`)
        }

        item.updated_text = s_date
    }
}

Items.copy = (curl) => {
    function blink (icon) {
        if (!icon) {
            return
        }

        icon.classList.add(`blink`)

        setTimeout(() => {
            icon.classList.remove(`blink`)
        }, 1000)
    }

    let curls = Curlist.get_selected_curls()

    if (!curls.includes(curl)) {
        curls = [curl]
    }

    let msgs = []

    for (let curl of curls) {
        let item = Items.get(curl)
        msgs.push(`${item.curl}\n${item.status}\n${item.updated_text}`)

        if (Peek.open && Peek.curl === curl) {
            blink(DOM.el(`#peek .peek_icon`))
        }

        blink(DOM.el(`.item_icon`, item.element))
    }

    let msg = msgs.join(`\n\n`)
    App.copy_to_clipboard(msg)
}

Items.show_menu = (args = {}) => {
    let def_args = {
        from: `curlist`,
    }

    App.def_args(def_args, args)
    let selected = []

    if (args.from === `curlist`) {
        selected = Curlist.get_selected_items()
        let item = Curlist.extract_item(args.e.target)

        if (!selected.length || !selected.includes(item)) {
            Curlist.select_item(item)
            selected = []
        }
    }

    let items = []

    if (selected.length > 1) {
        let curls = Curlist.get_selected_curls()

        items = [
            {
                text: `Copy`,
                action: () => {
                    Items.copy(args.curl)
                }
            },
            {
                text: `Remove`,
                action: () => {
                    App.remove_selected_curls()
                }
            },
            {
                separator: true,
            },
            {
                text: `To Top`,
                action: () => {
                    Curls.to_top(curls)
                }
            },
            {
                text: `To Bottom`,
                action: () => {
                    Curls.to_bottom(curls)
                }
            },
        ]
    }
    else {
        items = [
            {
                text: `Copy`,
                action: () => {
                    Items.copy(args.curl)
                }
            },
            {
                text: `Edit`,
                action: () => {
                    Curls.edit(args.curl)
                }
            },
            {
                text: `Remove`,
                action: () => {
                    Curls.remove([args.curl])
                }
            },
            {
                separator: true,
            },
            {
                text: `To Top`,
                action: () => {
                    Curls.to_top([args.curl])
                }
            },
            {
                text: `To Bottom`,
                action: () => {
                    Curls.to_bottom([args.curl])
                }
            },
        ]

        if (args.from === `container`) {
            items.push({
                separator: true,
            })

            items.push({
                text: `Peek`,
                action: () => {
                    Peek.show({curl: args.curl, force: true})
                }
            })
        }
    }

    NeedContext.show({
        items: items, e: args.e, after_hide: () => {
            Curlist.focus()
        }
    })
}