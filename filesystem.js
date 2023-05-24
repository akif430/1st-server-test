const fs = require('fs')

const initData = () => {
    //check data and reasigned
    if (fs.existsSync(`${__dirname}/dataHistory.json`)) {
        // console.log('p', typeof (fs.readFileSync(`${__dirname}/dataHistory.json`, { encoding: 'utf8', flag: 'r' })))
        let dataTemp = fs.readFileSync(`${__dirname}/dataHistory.json`, { encoding: 'utf8', flag: 'r' })
        if (dataTemp === "undefined:1")
            dataTemp = []
        // reasigned the data with the old
        console.log("Data exist in file system")
        return JSON.parse(dataTemp)
    }
    console.log('Data does not exist in file system');
    return JSON.parse([])
}

const saveData = async (data) => {
    //save data (rewrite all)
    await fs.promises.writeFile(`${__dirname}/dataHistory.json`, JSON.stringify(data))
}

const loadData = async () => {
    const data = await fs.promises.readFile(`${__dirname}/dataHistory.json`, 'utf-8')
    return JSON.parse(data)
}


module.exports = { initData, saveData, loadData }