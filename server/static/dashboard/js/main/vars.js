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
App.max_picker_items = 1000
App.max_status_list = 100
App.filter_debouncer_delay = 250
App.curlist_filter_debouncer_delay = 250
App.update_debouncer_delay = 250
App.change_debouncer_delay = 250
App.check_scroll_debouncer_delay = 100
App.status_menu_max_length = 110
App.changing = false
App.updating = false
App.network = `🛜`
App.date_mode = `12`
App.separator = `__separator__`
App.old_delay = App.YEAR * 1
App.peek_enabled = true
App.peek_open = false
App.default_color = `green`
App.default_sort = `newest`
App.default_updater = `minutes_5`
App.default_font = `sans-serif`
App.peek_curl = ``
App.wrap_enabled = true

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

App.empty_info = [
    `Add some curls to the list on the left.`,
    `These will be monitored for status changes.`,
    `Above you can change the status of your own curls.`,
    `Each color has their own set of curls.`,
    `Click <a href="/claim" target="_blank">here</a> to claim your own curl.`,
].join(`<br>`)

App.app_info = [
    `Curls are pointers to text that you control.`,
    `You can claim your own curl and receive a key.`,
    `With this key you can change the status of the curl.`,
    `The key can't be recovered and should be saved securely.`,
    `In this Dashboard you can monitor the curls you want.`,
    `Each color has its own set of curls.`,
    `You are limited to 100 curls per color.`,
].join(`\n`)

App.updater_mode = App.default_updater

App.updater_modes = [
    {value: `now`, name: `Update`, skip: true},
    {value: App.separator},
    {value: `minutes_1`, name: `1 Minute`},
    {value: `minutes_5`, name: `5 Minutes`},
    {value: `minutes_10`, name: `10 Minutes`},
    {value: `minutes_30`, name: `30 Minutes`},
    {value: `minutes_60`, name: `60 Minutes`},
    {value: App.separator},
    {value: `disabled`, name: `Disabled`},
]

App.sort_mode = App.default_sort

App.sort_modes = [
    {value: `order`, name: `Order`},
    {value: App.separator},
    {value: `newest`, name: `Newest`},
    {value: `oldest`, name: `Oldest`},
    {value: App.separator},
    {value: `curl_asc`, name: `Curl Asc`},
    {value: `curl_desc`, name: `Curl Desc`},
    {value: App.separator},
    {value: `status_asc`, name: `Status Asc`},
    {value: `status_desc`, name: `Status Desc`},
    {value: App.separator},
    {value: `curl_short`, name: `Curl Short`},
    {value: `curl_long`, name: `Curl Long`},
    {value: App.separator},
    {value: `status_short`, name: `Status Short`},
    {value: `status_long`, name: `Status Long`},
]

App.color_mode = App.default_color

App.color_modes = [
    {value: `red`, name: `Red`},
    {value: `green`, name: `Green`},
    {value: `blue`, name: `Blue`},
    {value: `yellow`, name: `Yellow`},
    {value: `purple`, name: `Purple`},
    {value: `white`, name: `White`},
]

App.font_mode = App.default_font

App.font_modes = [
    {value: `sans-serif`, name: `Sans`},
    {value: `serif`, name: `Serif`},
    {value: `monospace`, name: `Mono`},
    {value: `cursive`, name: `Cursive`},
]