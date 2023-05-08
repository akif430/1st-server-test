const express = require('express')
const app = express()

process.env.CYCLIC_DB = 'bewildered-galoshes-eelCyclicDB'
const CyclicDB = require('@cyclic.sh/dynamodb')
const table = CyclicDB("bewildered-galoshes-eelCyclicDB")
let wtl = table.collection("waterLevel")

app.use(express.json())
app.set("view engine", "ejs")

app.all('/', (req, res) => res.render("index.ejs"))

app.post("/save", async (req, res) => {
    if (req.body === undefined || req.body === {}) {
        res.status(500)
        return
    }
    // dateTime
    // water level
    // condition
    let result = await wtl.set(req.body.dateTime, {
        waterLevel: req.body.waterLevel,
        condition: req.body.condition
    })
    res.send("success");
})

app.get('/fetch', async (req, res) => {
    let list = await wtl.filter({})
    console.log(list);
    res.send(list)
})

app.listen(process.env.PORT || 3000)
