const express = require('express')
const app = express()
const moment = require('moment')
process.env.CYCLIC_DB = 'real-puce-llama-sariCyclicDB'
const CyclicDB = require('@cyclic.sh/dynamodb')
const db = CyclicDB("real-puce-llama-sariCyclicDB")
let wtl = db.collection("waterLevel")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

app.post("/save", async (req, res) => {

    if (req.body === undefined || req.body === {}) {
        res.status(500)
        return
    }

    const date = moment().format('YYYY / MM / DD, HH:mm:ss');

    let result = await wtl.set(date, {
        waterLevel: req.body.waterLevel,
        condition: "safe"
    })

    res.status(200).json({
        status: 'success'
    });
})

app.get('/:col/:limit', async (req, res) => {
    //example:  https://real-puce-llama-sari.cyclic.app/waterLevel/10
    const col = req.params.col
    const lim = Number(req.params.limit)
    const filter = {
        expression: undefined,
        attr_vals: undefined,
        attr_names: undefined
    }
    try {
        // const items = await db.collection(col).parallel_scan(filter, 0, 1, lim + 1)
        let items = await db.collection(col).filter({})
        items.results.sort((a, b) => (a.key < b.key ? 1 : -1))
        items.results = items.results.slice(0, lim-1)
        console.log(items);
        res.json(items).end()
    } catch (error) {
        res.sendStatus(500).end()
    }
})

// Catch all handler for all other request and direct to main page
app.use('*', (req, res) => {
    res.render("index.ejs")
})

app.listen(process.env.PORT || 3000)
