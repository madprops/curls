const App = {}

App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.HOUR = App.MINUTE * 60
App.DAY = App.HOUR * 24
App.WEEK = App.DAY * 7
App.MONTH = App.DAY * 30
App.YEAR = App.DAY * 365

App.key_length = 22
App.status_max_length = 500
App.max_status_list = 100
App.status_menu_max_length = 110

App.old_delay = App.YEAR * 1

App.colors_alpha = {}
App.colors_alpha_2 = {}
App.block_items = {}
App.console_logs = true
App.controls_enabled = true
App.date_mode = `12`
App.default_color = `green`
App.default_font = `sans-serif`
App.default_border = `solid`
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