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

    const date = new Date();
    console.log(date.toString());

    // if (req.body.waterLevel ){
        
    // }
    
    let result = await wtl.set(date.toString, {
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
app.listen(process.env.PORT || 3000)
