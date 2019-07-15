let express = require('express')
let path = require('path')
let app = express()
let port = 80

// respond with "hello world" when a GET request is made to the homepage
app.use('/', express.static(path.join(__dirname, 'client')))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))