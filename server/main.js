let express = require('express')
let path = require('path')
let scrape = require('./scrape.js').scrape
let app = express()
let port = 3000

// respond with "hello world" when a GET request is made to the homepage
app.use('/', express.static(path.join(__dirname,"..", 'client')))

app.get('/site/:http/*', async function (req, res) {
    console.log(req.params)
    let url = `${req.params.http}://${req.params[0]}`
    let result = await scrape(url)
    res.send(JSON.stringify(result))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))