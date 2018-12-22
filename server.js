const express = require(`express`);
const app = express();
const path = require(`path`);
const multer = require('multer');
const HTTP_PORT = process.env.PORT || 8080; //TODO: Add Heroku env
const ds = require(`./dataService.js`);
const dsAuth = require(`./dsAuth.js`);
const exphbs = require(`express-handlebars`);
const bodyParser = require('body-parser');

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
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));

//renders main route
app.get(`/`, (req, res) => {
    res.render(`index`);
})

//sends user to the CREATE part of CRUD
app.get(`/create`, (req, res) => {
    res.render(`create`);
})

//gets data from CREATE part of CRUD
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

//sends user to READ part of CRUD, showing all recipes in the database
app.get(`/view`, (req, res) => {
    ds.getAllRecipes().then((ObjReturn) => {
        res.render(`view`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`OOPS! Something went wrong with getAllRecipes ${err}`);
        res.redirect(`/`);
    });
})


//UPDATEs a recipe
app.post(`/create/update`,upload.single(`foodPhoto`),(req,res)=>{
    req.body.difficulty = Number(req.body.difficulty);
    console.log(req.body);
    ds.UpdateRecipe(req.body).then((data)=>{
        console.log(`inside success`);
        res.redirect(`/view`);
    }).catch((err)=>{
        res.redirect(`/view`);
    });
})

//renders a recipe in create hbs so that user can UPDATE it (CRUD)
app.get(`/create/:id`, (req,res)=>{
    ds.getOneRecipe(req.params.id).then((ObjReturn) => {
        res.render(`create`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`error! could not find recipe by that ID ${err}`);
        res.render(`create`);
    });
})

//deletes a recipe by specific id
app.get(`/delete/:id`,(req,res)=>{
    console.log(req.params.id);
    ds.deleteRecipe(req.params.id).then((data)=>{
        console.log(data);
        res.redirect(`/view`);
    }).catch((err)=>{
        console.log(`could not delete: ${err}`);
        res.redirect(`/view`);
    })
})

//renders a full recipe (READ)
app.get(`/viewFull/:id`, (req, res) => {
    ds.getOneRecipe(req.params.id).then((ObjReturn) => {
        res.render(`viewFull`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`error! could not find recipe by that ID ${err}`);
        res.render(`viewFull`);
    });
})

//Displays the login page to the user
app.get(`/login`,(req,res)=>{
    res.render(`login`);
})

//get login information and process it to verify if the details were correct
app.post(`/login`,(req,res)=>{
    console.log(req.body);
    res.redirect(`/`); //TEMP
    //TODO: Add a dataservice authicator
})

//sends user to signup page so user can create and POST to /signup
app.get(`/signup`, (req,res)=>{
    res.render(`signup`);
})

//gets signup information and authenticates if it meets the requirements
app.post(`/signup`, (req,res)=>{
    console.log(req.body);
    dsAuth.creaUser(req.body).then((data)=>{
        console.log(`successfully created new user ${data}`);
        res.redirect(`/login`);
    }).catch((err)=>{
        console.log(`error creating user ${err}`);
        res.redirect(`/login`);
    })
})

app.get(`/temp`, (req, res) => {
    res.render(`temp`, { data: { visible: false } });
})

// ds.initialize().then(() => {
//     app.listen(HTTP_PORT, () => {
//         console.log(`listening on ${HTTP_PORT}`);
//     })
//     console.log(`successfully connected to MongoDB`);
// }).catch((err) => {
//     console.log(`unable to connect to MongoDB ${err}`);
// });

ds.initialize().then(()=>{
    dsAuth.initialize().then(()=>{
        app.listen(HTTP_PORT,()=>{
            console.log(`listening on ${HTTP_PORT}`);
        });
    }).catch((err)=>{
        console.log(`could not connect to Users database`);
    });
}).catch((err)=>{
    console.log(`could not connect to recipe db ${err}`);
})