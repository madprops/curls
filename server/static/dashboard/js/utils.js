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
    if (App.info_enabled) {
        console.info(msg)
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