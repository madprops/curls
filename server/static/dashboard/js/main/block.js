/*

This is used to rate limit certain operations
Every operation adds 1 charge to a registered item
If the charge is above the limit, the operation is blocked
Charges are decreased over time

*/

const Block = {
    items: {},
    interval_delay: 2000,
    date_delay: 500,
    relief: 0.1,
}

Block.setup = () => {
    setInterval(() => {
        for (let name in Block.items) {
            let item = Block.items[name]

            if ((Utils.now() - item.date) < Block.date_delay) {
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
    Block.items[name] = {
        charge: 0,
        limit: limit,
        date: 0,
    }
}

Block.charge = (name) => {
    let item = Block.items[name]
    item.date = Utils.now()

    if (item.charge >= item.limit) {
        return true
    }

    item.charge += 1
    return false
}