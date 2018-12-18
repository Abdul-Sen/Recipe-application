const express = require(`express`);
const app = express();
const path = require(`path`);
const multer = require('multer');
const HTTP_PORT = 8080; //TODO: Add Heroku env
const ds = require(`./dataService.js`);
const exphbs = require(`express-handlebars`);

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },    
    }
})
);
app.set('view engine', '.hbs');

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
    res.render(`index`);
})

app.get(`/create`, (req, res) => {
    res.render(`create`);
})

app.post(`/create/new`, upload.single(`foodPhoto`), (req, res) => {
    req.body.filename = req.file.filename;
    req.body.difficulty = Number(req.body.difficulty);
    ds.addRecipe(req.body).then((result) => {
        res.redirect(`/view`);
        return;
    }).catch((err) => {
        console.log(err);
        res.send(err);
        return;
    });
});

app.post(`/create/update`,upload.single(`foodPhoto`),(req,res)=>{
    console.log(req.body);
    req.body.difficulty = Number(req.body.difficulty);
    ds.UpdateRecipe(req.body).then((data)=>{
        console.log(`inside success`);

        res.redirect(`/view`);
    }).catch((err)=>{
        // console.log(`error! ${err}`);
        res.redirect(`/view`);
    });
})

app.get(`/view`, (req, res) => {
    ds.getAllRecipes().then((ObjReturn) => {
        res.render(`view`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`OOPS! Something went wrong with getAllRecipes ${err}`);
        res.redirect(`/`);
    });
})

app.get(`/create/:id`, (req,res)=>{
    console.lo
    ds.getOneRecipe(req.params.id).then((ObjReturn) => {
        res.render(`create`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`error! could not find recipe by that ID ${err}`);
        res.render(`create`);
    });
})

app.get(`/viewFull/:id`, (req, res) => {

    ds.getOneRecipe(req.params.id).then((ObjReturn) => {
        res.render(`viewFull`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`error! could not find recipe by that ID ${err}`);
        res.render(`viewFull`);
    });
})


app.get(`/temp`, (req, res) => {
    res.render(`temp`, { data: { visible: false } });
})

ds.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`listening on ${HTTP_PORT}`);
    })
    console.log(`successfully connected to MongoDB`);
}).catch((err) => {
    console.log(`unable to connect to MongoDB ${err}`);
});