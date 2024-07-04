const App = {}

App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.HOUR = App.MINUTE * 60
App.DAY = App.HOUR * 24
App.WEEK = App.DAY * 7
App.MONTH = App.DAY * 30
App.YEAR = App.DAY * 365

App.max_curls = 100
App.curl_max_length = 20
App.key_length = 22
App.status_max_length = 500
App.max_picker_items = 1000
App.max_status_list = 100
App.status_menu_max_length = 110

App.old_delay = App.YEAR * 1
App.update_delay = App.MINUTE * 5
App.filter_debouncer_delay = 250
App.curlist_filter_debouncer_delay = 250
App.update_debouncer_delay = 250
App.change_debouncer_delay = 250
App.check_scroll_debouncer_delay = 100
App.update_items_debouncer_delay = 100
App.peek_debouncer_delay = 100
App.highlight_items_debouncer_delay = 25
App.clear_delay = 800

App.items = []
App.colors_alpha = {}
App.colors_alpha_2 = {}
App.console_logs = true
App.curlist_enabled = true
App.updates_enabled = false
App.changing = false
App.updating = false
App.peek_enabled = true
App.highlight_enabled = true
App.peek_open = false
App.wrap_enabled = true
App.controls_enabled = true
App.peek_curl = ``
App.date_mode = `12`
App.default_color = `green`
App.default_sort = `newest`
App.default_updater = `minutes_5`
App.default_font = `sans-serif`
App.default_border = `solid`
App.default_filter = `all`
App.separator = `__separator__`
App.network = `🛜`

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

App.intro = [
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
    {value: `now`, name: `Update`, skip: true, info: `Update now`},
    {value: App.separator},
    {value: `minutes_1`, name: `1 Minute`, info: `Update automatically every minute`},
    {value: `minutes_5`, name: `5 Minutes`, info: `Update automatically every 5 minutes`},
    {value: `minutes_10`, name: `10 Minutes`, info: `Update automatically every 10 minutes`},
    {value: `minutes_30`, name: `30 Minutes`, info: `Update automatically every 30 minutes`},
    {value: `minutes_60`, name: `60 Minutes`, info: `Update automatically every hour`},
    {value: App.separator},
    {value: `disabled`, name: `Disabled`},
]

App.sort_mode = App.default_sort

App.sort_modes = [
    {value: `order`, name: `Order`, info: `Use the same order as the curlist`},
    {value: App.separator},
    {value: `newest`, name: `Newest`, info: `Most recently changed at the top`},
    {value: `oldest`, name: `Oldest`, info: `Oldest ones at the top`},
    {value: App.separator},
    {value: `curl_asc`, name: `Curl Asc`, info: `Sort curls alphabetically in ascending order`},
    {value: `curl_desc`, name: `Curl Desc`, info: `Sort curls alphabetically in descending order`},
    {value: App.separator},
    {value: `status_asc`, name: `Status Asc`, info: `Sort status alphabetically in ascending order`},
    {value: `status_desc`, name: `Status Desc`, info: `Sort status alphabetically in descending order`},
    {value: App.separator},
    {value: `curl_short`, name: `Curl Short`, info: `Sort by the length of the curl in ascending order`},
    {value: `curl_long`, name: `Curl Long`, info: `Sort by the length of the curl in descending order`},
    {value: App.separator},
    {value: `status_short`, name: `Status Short`, info: `Sort by the length of the status in ascending order`},
    {value: `status_long`, name: `Status Long`, info: `Sort by the length of the status in descending order`},
]

App.color_mode = App.default_color

App.color_modes = [
    {value: `red`, name: `Red`, info: `Go to Red`},
    {value: `green`, name: `Green`, info: `Go to Green`},
    {value: `blue`, name: `Blue`, info: `Go to Blue`},
    {value: `yellow`, name: `Yellow`, info: `Go to Yellow`},
    {value: `purple`, name: `Purple`, info: `Go to Purple`},
    {value: `white`, name: `White`, info: `Go to White`},
]

App.font_mode = App.default_font

App.font_modes = [
    {value: `sans-serif`, name: `Sans`, info: `Use Sans-Serif as the font`},
    {value: `serif`, name: `Serif`, info: `Use Serif as the font`},
    {value: `monospace`, name: `Mono`, info: `Use Monospace as the font`},
    {value: `cursive`, name: `Cursive`, info: `Use Cursive as the font`},
]

App.border_mode = App.default_border

App.border_modes = [
    {value: `solid`, name: `Solid`, info: `Normal solid border`},
    {value: `dotted`, name: `Dotted`, info: `Dotted border`},
    {value: `dashed`, name: `Dashed`, info: `Dashed border`},
    {value: `bigger`, name: `Bigger`, info: `Normal border but twice as thick`},
    {value: App.separator},
    {value: `none`, name: `None`, info: `No border`},
]

App.filter_mode = App.default_filter

App.filter_modes = [
    {value: `all`, name: `All`, info: `Show all curls`},
    {value: App.separator},
    {value: `today`, name: `Today`, info: `Show the curls that changed today`},
    {value: `week`, name: `Week`, info: `Show the curls that changed this week`},
    {value: `month`, name: `Month`, info: `Show the curls that changed this month`},
    {value: App.separator},
    {value: `curl`, name: `Curl`, info: `Filter by curl`},
    {value: `status`, name: `Status`, info: `Filter by status`},
    {value: `date`, name: `Date`, info: `Filter by date`},
    {value: App.separator},
    {value: `owned`, name: `Owned`, info: `Show the curls that you control`},
]