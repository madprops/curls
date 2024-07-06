/*

This is used to rate limit certain operations
Every operation adds 1 charge to a registered instance
If the charge is above the limit, the operation is blocked
Charges are decreased over time

*/

class Block {
    static instances = []
    static interval_delay = 2000
    static date_delay = 500
    static relief = 0.1

    constructor(limit) {
        this.limit = limit
        this.charge = 0
        this.date = 0
        Block.instances.push(this)
    }

    static setup() {
        setInterval(() => {
            for (let block of Block.instances) {
                if ((Utils.now() - block.date) < this.date_delay) {
                    continue
                }

                if (block.charge > 0) {
                    let dec = Math.max(1, Math.round(block.charge * this.relief))
                    block.charge -= parseInt(dec)
                }
            }
        }, this.interval_delay)
    }

    add_charge() {
        this.date = Utils.now()

        if (this.charge >= this.limit) {
            return true
        }

        this.charge += 1
        return false
    }
}