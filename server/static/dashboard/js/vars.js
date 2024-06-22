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
App.info_enabled = true
App.last_items = []
App.last_used_curls = []
App.last_missing = []
App.clear_delay = 800
App.max_picker_items = 10
App.filter_debouncer_delay = 200
App.update_debouncer_delay = 200
App.change_debouncer_delay = 200
App.changing = false
App.updating = false

App.curl_too_long = `Error: Curl is too long`
App.key_too_long = `oijioError: Key is too long`
App.status_too_long = `Error: Status is too long`

App.colors = {
    red: `rgb(255, 89, 89)`,
    green: `rgb(87, 255, 87)`,
    blue: `rgb(118, 120, 255)`,
    yellow: `rgb(255, 219, 78)`,
    purple: `rgb(193, 56, 255)`,
    white: `rgb(255, 255, 255)`,
}