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
App.update_debouncer_delay = 250
App.change_debouncer_delay = 250
App.changing = false
App.updating = false
App.network = `🛜`
App.date_mode = `12`
App.separator = `__separator__`

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

App.sort_mode = `newest`

App.sort_modes = [
    {value: `order`, name: `Order`},
    {value: App.separator},
    {value: `newest`, name: `Newest`},
    {value: `oldest`, name: `Oldest`},
    {value: `curl_asc`, name: `Curl Asc`},
    {value: `curl_desc`, name: `Curl Desc`},
    {value: App.separator},
    {value: `status_asc`, name: `Status Asc`},
    {value: `status_desc`, name: `Status Desc`},
    {value: App.separator},
    {value: `short_curl`, name: `Short Curl`},
    {value: `long_curl`, name: `Long Curl`},
    {value: App.separator},
    {value: `short_status`, name: `Short Status`},
    {value: `long_status`, name: `Long Status`},
]