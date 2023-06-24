const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
const moment = require('moment-timezone');
const { initData, loadData, saveData } = require('./filesystem.js')

//normal  = 0.5 ke bawah
//alert  = 0.5 - 1.0 
//warning = 1.0 - 1.5
//danger = lebih 1.5


//nanti kena tukar sini lepas ukur Depth of river kat FKM 


//water level hit alert if more than 1.0
const TrueWaterLevelAlert = 1.0;

//water level hit warning if more than 1.5
const TrueWaterLevelWarning = 1.5;

//water level hit danger if more than 2.0
const TrueWaterLevelDanger = 2.0;

//Determine the River Depth (Make Measurement)
const RiverDepth = 2.0;

//Determine the Height of sensor above River Bank 
const SensorDistFromRiverBank = 1.20;

//Formula 
//  TruewaterLevel = RiverDepth + WaterLevel (fromsensor) - SensorDistFromRiverBank 



const WaterTemperatureWarningCold = 10;
const WaterTemperatureWarningHot = 35;

//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// https://vast-blue-starfish-cap.cyclic.app/
process.env.CYCLIC_DB = 'vast-blue-starfish-capCyclicDB'
const CyclicDB = require('@cyclic.sh/dynamodb')
const db = CyclicDB("vast-blue-starfish-capCyclicDB")
let wtl = db.collection("waterLevel")
let wtemp = db.collection("waterTemperature")                                                         //+Temperature

let dataItemArr = initData()
app.use('/public/images/', express.static('./public/images'));
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
    if (req.body === undefined || req.body === {} || !req.body.waterLevel || isNaN(req.body.waterLevel)) {
        res.status(400).json({
            status: 'request body is either undefined, empty, does not have `waterLevel` key or not a number.'
        });
        return
    }
    //condition statement
    let TrueWaterLevel = RiverDepth + SensorDistFromRiverBank - Number(req.body.waterLevel)

    let condition
    if (TrueWaterLevel < TrueWaterLevelAlert) {
        condition = 'normal'
    }
    else if (TrueWaterLevel < TrueWaterLevelWarning) {
        condition = 'alert'
    }
    else if (TrueWaterLevel < TrueWaterLevelDanger) {
        condition = 'warning'
    }
    else {
        condition = 'danger'
    }

    const date = moment().tz('Asia/Kuala_Lumpur').format('YYYY / MM / DD, HH:mm:ss');
    let result = await wtl.set(date, {
        waterLevel: Number(TrueWaterLevel.toFixed(2)),
        condition
    })
    res.status(200).json({
        status: 'success'
    });
})

//waterTemperature: req.body.waterTemperature,                                                                                                  //+Temperature
//UNTUK TEMPERATURE

app.post('/saveTemperature', async (req, res) => {
    if (req.body === undefined || req.body === {} || !req.body.waterTemperature || isNaN(req.body.waterTemperature)) {
        res.status(400).json({
            status: 'request body is either undefined, empty, does not have `waterTemperature` key or not a number'
        });
        return
    }
    let waterTemperature = Number(req.body.waterTemperature)
    let condition = 'danger'
    if (waterTemperature > WaterTemperatureWarningCold && waterTemperature < WaterTemperatureWarningHot) {
        condition = 'normal'
    }

    const date = moment().tz('Asia/Kuala_Lumpur').format('YYYY / MM / DD, HH:mm:ss');
    let result = await wtemp.set(date, {
        waterTemperature: Number(waterTemperature.toFixed(2)),
        condition
    })
    res.status(200).json({
        status: 'success'
    });
})

app.delete('/delete/:col', async (req, res) => {
    const col = req.params.col
    const key = req.body.key
    let result = await db.collection(col).delete(req.body.key)
    if(result){
        res.status(200).json({
            status: 'success'
        });
        return
    }else{
        res.status(400).json({
            key,
            status: 'key may be wrong'
        });
        return 
    }
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

        res.json({ waterLevel, waterTemperature }).end()

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