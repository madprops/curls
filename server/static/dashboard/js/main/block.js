/*

This is used to rate limit certain operations
Every operation adds 1 charge to a registered item
If the charge is above the limit, the operation is blocked
Charges are decreased over time

*/

class Block {
    static items = {}
    static interval_delay = 2000
    static date_delay = 500
    static relief = 0.1

    static setup() {
        setInterval(() => {
            for (let name in this.items) {
                let item = this.items[name]

                if ((Utils.now() - item.date) < this.date_delay) {
                    continue
                }

                if (item.charge > 0) {
                    let dec = Math.max(1, Math.round(item.charge * this.relief))
                    item.charge -= parseInt(dec)
                }
            }
        }, this.interval_delay)
    }

    static register(name, limit) {
        this.items[name] = {
            charge: 0,
            limit: limit,
            date: 0,
        }
    }

    static charge(name) {
        let item = this.items[name]
        item.date = Utils.now()

        if (item.charge >= item.limit) {
            return true
        }

        item.charge += 1
        return false
    }
}