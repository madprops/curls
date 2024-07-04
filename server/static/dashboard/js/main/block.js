const Block = {
    interval_delay: 2000,
    date_delay: 500,
    relief: 0.1,
}

Block.setup = () => {
    setInterval(() => {
        for (let name in App.block_items) {
            let item = App.block_items[name]

            if ((App.now() - item.date) < Block.date_delay) {
                continue
            }

            if (item.charge > 0) {
                let dec = Math.max(1, Math.round(item.charge * Block.relief))
                item.charge -= parseInt(dec)
            }
        }
    }, Block.interval_delay)
}

Block.register = (name, limit) => {
    App.block_items[name] = {
        charge: 0,
        limit: limit,
        date: 0,
    }
}

Block.charge = (name) => {
    let item = App.block_items[name]
    item.date = App.now()

    if (item.charge >= item.limit) {
        return true
    }

    item.charge += 1
    return false
}