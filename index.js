const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
const moment = require('moment-timezone');
const { initData, loadData, saveData } = require('./filesystem.js')

//water level hit warning if below 0.5
const WaterLevelWarning = 0.5;
//water level hit danger if below 0.2
const WaterLevelDanger = 0.2;

const WaterTemperatureWarningCold = 10;
const WaterTemperatureWarningHot = 40;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.env.CYCLIC_DB = 'real-puce-llama-sariCyclicDB'
const CyclicDB = require('@cyclic.sh/dynamodb')
const db = CyclicDB("real-puce-llama-sariCyclicDB")
let wtl = db.collection("waterLevel")
let wtemp = db.collection("waterTemperature")                                                         //+Temperature

let dataItemArr = initData()

app.post('/savefs', async (req, res) => {
    if (req.body === undefined || req.body === {}) {
        res.status(500)
        return
    }

    const date = new Date().toLocaleString('en-ES');
    console.log(`New ${date}`);
    dataItemArr.push({ waterLevel: req.body.waterLevel, Date: date, condition: "safe" })                    //+Temperature //waterTemperature:req.body.waterTemperature,
    console.log(dataItemArr);
    saveData(dataItemArr)
    res.status(200).json({
        status: 'success'
    });
})

app.post('/save', async (req, res) => {
    if (req.body === undefined || req.body === {}) {
        res.status(500)
        return
    }
    //condition statement
    let condition = 'normal'
    if(req.body.waterLevel <= WaterLevelWarning && req.body.waterLevel >  WaterLevelDanger){
        condition = 'warning'
    }else if(req.body.waterLevel <=  WaterLevelDanger){
        condition = 'danger'
    }

    const date = moment().tz('Asia/Kuala_Lumpur').format('YYYY / MM / DD, HH:mm:ss');
    let result = await wtl.set(date, {
        waterLevel: req.body.waterLevel,
        condition
    })
    res.status(200).json({
        status: 'success'
    });
})

//waterTemperature: req.body.waterTemperature,                                                                                                  //+Temperature
//UNTUK TEMPERATURE

app.post('/saveTemperature', async (req, res) => {
    if (req.body === undefined || req.body === {}) {
        res.status(500)
        return
    }
    let condition = 'danger'
    if (req.body.waterTemperature > WaterTemperatureWarningCold && req.body.waterTemperature < WaterTemperatureWarningHot) {
        condition = 'normal'
    }
    
    const date = moment().tz('Asia/Kuala_Lumpur').format('YYYY / MM / DD, HH:mm:ss');
    let result = await wtemp.set(date, {
        waterTemperature: req.body.waterTemperature,
        condition
    })
    res.status(200).json({
        status: 'success'
    });
})

app.get('/fs/:lim', async (req, res) => {
    const lim = req.params.lim
    try {
        let items = await loadData()
        const startIndex = items.length - lim
        items = items.slice(startIndex < 0 ? 0 : startIndex, items.length)
        console.log(items);
        res.json(items).end()
    } catch (error) {
        res.sendStatus(500).end()
    }

})

app.get('/:col/:limit', async (req, res) => {
    //example:  https://real-puce-llama-sari.cyclic.app/waterLevel/10
    const col = req.params.col
    const lim = Number(req.params.limit)
    try {
        //fetch from waterLevel collection
        let waterLevel = await db.collection(col).filter({})
        waterLevel.results.sort((a, b) => (a.key < b.key ? 1 : -1))
        waterLevel.results = waterLevel.results.slice(0, lim)

        //fetch from waterTemperature collection
        let waterTemperature = await db.collection('waterTemperature').filter({})
        waterTemperature.results.sort((a, b) => (a.key < b.key ? 1 : -1))
        waterTemperature.results = waterTemperature.results.slice(0, lim)
          
        res.json({waterLevel , waterTemperature}).end()

    } catch (error) {
        res.sendStatus(500).end()
    }
})

app.get('/:col', async (req, res) => {
    //example:  https://real-puce-llama-sari.cyclic.app/waterLevel/10
    const col = req.params.col
    try {
        let items = await db.collection(col).filter({})
        items.results.sort((a, b) => (a.key < b.key ? 1 : -1))
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