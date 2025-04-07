class Storage {
  static debouncer_delay = 250

  static setup = () => {
    this.debouncer = Utils.create_debouncer((key) => {
      this.do_check(key)
    }, this.debouncer_delay)

    window.addEventListener(`storage`, (e) => {
      this.check(e.key)
    })
  }

  static check = (key) => {
    this.debouncer.call(key)
  }

  static do_check = (key) => {
    if (key.startsWith(`curls_data`)) {
      Curls.fill_colors()
      Update.update()
    }
  }
}