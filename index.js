const express = require('express')
const app = express()
const moment = require('moment')
process.env.CYCLIC_DB = 'bewildered-galoshes-eelCyclicDB'
const CyclicDB = require('@cyclic.sh/dynamodb')
const table = CyclicDB("bewildered-galoshes-eelCyclicDB")
let wtl = table.collection("waterLevel")

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

app.get('/fetch', async (req, res) => {
    let list = await wtl.filter({})
    res.send(list)
})

// Catch all handler for all other request and direct to main page
app.use('*', (req, res) => {
    res.render("index.ejs")
})

app.listen(process.env.PORT || 3000)
