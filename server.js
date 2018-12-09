const express = require(`express`);
const app = express();
const path = require(`path`);
/*
TODO List:
1-Fix Jquery and Jquery UI, make sure hey are both running on the temp page, then remove temp page once this is sorted
 */
const HTTP_PORT = 8080; //TODO: Add Heroku env
app.use(express.static("public"));

app.get(`/`,(req,res)=>{
    res.sendFile(path.join(__dirname,`/views/index.html`));
})

app.get(`/create`, (req,res)=>{
    res.sendFile(path.join(__dirname,`/views/create.html`));
})

app.get(`/temp`, (req,res)=>{
    res.sendFile(path.join(__dirname,`/views/temp.html`));
})
app.listen(HTTP_PORT,()=>{
    console.log(`Listening on ${HTTP_PORT}`);
})

