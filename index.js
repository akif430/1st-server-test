const express = require('express')
const app = express()
const fs =require('fs')
const path = require('path')

const range_warning = 1.0
const range_danger = 0.5


// process.env.CYCLIC_DB = 'bewildered-galoshes-eelCyclicDB'
// const CyclicDB = require('@cyclic.sh/dynamodb')
// const table = CyclicDB("bewildered-galoshes-eelCyclicDB")
// let wtl = table.collection("waterLevel")


// data Item
let dataItemArr = []

const initData = () => {

    //check data and reasigned
    if (fs.existsSync(`${__dirname}/dataHistory.json`)){
        // console.log('p', typeof (fs.readFileSync(`${__dirname}/dataHistory.json`, { encoding: 'utf8', flag: 'r' })))
        dataTemp = fs.readFileSync(`${__dirname}/dataHistory.json`, { encoding: 'utf8', flag: 'r' })
        if (dataTemp === "undefined:1" ){
            dataTemp = []
        }
        data = JSON.parse(dataTemp)
        // reasigned the data with the old
        dataItemArr = data
        console.log("Data exist")
        
    }else{
        console.log("data doesnt exist!")
    }
}

//init data
initData()

// save data
const saveData = async (data) => {
    // {
    //     Date: Date,
    //     waterLevel: String,
    //     Condition:String
    // }
    //Push


// BANJIR PUNYA FUNCTION
    // if (data.waterLevel <= range_warning){
    //     data.condition = 'warning'
    // }
    // else if (data.waterLevel) <= range_danger


    dataItemArr.push(data)
    //write file
    await fs.promises.writeFile(`${__dirname}/dataHistory.json`, JSON.stringify(dataItemArr))
}

// load_data
const loadData = async () => {
    //Load file and return data
    data = await fs.promises.readFile(`${__dirname}/dataHistory.json`)
    

    // data = JSON.parse()

    return data
}

app.use(express.json())
app.set("view engine", "ejs")

app.all('/', (req, res) => res.render("index.ejs"))

app.post("/save", async (req, res) => {

    // console.log(req.params)

    if (req.body === undefined || req.body === {}) {
        res.status(500)
        return
    }

    const date = new Date().toLocaleString('en-ES');
    console.log(`New ${date}`);
    
    // if (req.body.waterLevel ){
        
    // }
    // let result = await wtl.set(date, {
    //     waterLevel: req.body.waterLevel,
    //     condition: "safe"
    // })


    //save and push
    saveData({waterLevel:req.body.waterLevel, Date:date, condition:"safe"})
    // console.log(req.body)

    // console.log(`Data Received ${req.body}`)
    // console.log(req.body)
    // dateTime
    // water level
    // condition
    // if (req.body !== undefined){
    //     let result = await wtl.set(req.body.dateTime, {
    //         waterLevel: req.body.waterLevel,
    //         condition: req.body.condition
    //     })
    // }



    // res.send("success");
    res.status(200).json({
        status: 'success'
    });
})


app.get('/fetch', async (req, res) => {

    // let list = await wtl.filter({})
    // console.log(list);
    // res.send(list)
    dataFetch  = await loadData()
    console.log(dataFetch)
    res.send(dataFetch)
})

app.listen(process.env.PORT || 3000)
