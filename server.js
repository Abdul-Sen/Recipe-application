const express = require(`express`);
const app = express();
const path = require(`path`);
const multer = require('multer');
const HTTP_PORT = 8080; //TODO: Add Heroku env
const ds = require(`./dataService.js`);

app.use(express.static("public"));

const storage = multer.diskStorage({
    destination: "./public/images/",
    filename: function (req, file, cb) {
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
        // this is a simple example.
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.get(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, `/views/index.html`));
})

app.get(`/create`, (req, res) => {
    res.sendFile(path.join(__dirname, `/views/create.html`));
})

app.post(`/create/new`, upload.single(`foodPhoto`), (req, res) => {
    req.body.filename = req.file.filename;
    req.body.difficulty = Number(req.body.difficulty);
    ds.addRecipe(req.body).then((result) => {
        console.log(`inside ds.addRecipe THEN part, the returned value from function is: ${result}`);
        res.redirect(`/`);
        return;
    }).catch((err) => {
        res.send(err);
        return;
    });
});

app.get(`/view`,(req,res)=>{
    res.sendFile(path.join(__dirname, `/views/view.html`));
})


app.get(`/temp`, (req, res) => {
    res.sendFile(path.join(__dirname, `/views/temp.html`));
})

ds.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`listening on ${HTTP_PORT}`);
    })
    console.log(`successfully connected to MongoDB`);
}).catch((err) => {
    console.log(`unable to connect to MongoDB ${err}`);
});