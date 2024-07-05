const App = {}

App.SECOND = 1000
App.MINUTE = App.SECOND * 60
App.HOUR = App.MINUTE * 60
App.DAY = App.HOUR * 24
App.WEEK = App.DAY * 7
App.MONTH = App.DAY * 30
App.YEAR = App.DAY * 365

App.old_delay = App.YEAR * 1
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