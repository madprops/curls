App.setup_block = () => {
    setInterval(() => {
        for (let name in App.block_items) {
            let item = App.block_items[name]

            if (item.charge > 0) {
                let dec = Math.max(1, Math.round(item.limit * 0.1))
                item.charge -= parseInt(dec)
            }
        }
    }, 1000)
}

App.register_block = (name, limit) => {
    App.block_items[name] = {
        charge: 0,
        limit: limit,
    }
}

App.block_charge = (name) => {
    let item = App.block_items[name]

    if (item.charge >= item.limit) {
        return true
    }

    item.charge += 1
    return false
}