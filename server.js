const express = require(`express`);
const app = express();
const path = require(`path`);
const multer = require('multer');
const HTTP_PORT = process.env.PORT || 8080;
const ds = require(`./dataService.js`);
const dsAuth = require(`./dsAuth.js`);
const exphbs = require(`express-handlebars`);
const bodyParser = require('body-parser');
const clientSessions = require(`client-sessions`);

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

//Setting up sessions
app.use(clientSessions({
    cookieName: 'session', // cookie name dictates the key name added to the request object
    secret: 'Wbg83bhQfuKewcFfavAfwbaHAcOkJKGBD9IPhLmetKwMfMslBr', // should be a large unguessable string
    duration: 2 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));

//adds current session to the response so that handlebars can access session keys
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}


//renders main route
app.get(`/`, (req, res) => {
    res.render(`index`);
})

//sends user to the CREATE part of CRUD
app.get(`/create`, ensureLogin, (req, res) => {
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
app.get(`/view`, ensureLogin, (req, res) => {
    if(req.query.difficulty)
    {
        ds.getRecipeByDifficulty(req.query.difficulty).then((ObjReturn)=>{
            res.render(`view`,{data: ObjReturn});
        }).catch((err)=>{
            console.log(`OOPS! Something went wrong with getAllRecipes ${err}`);
            res.redirect(`/`);    
        });
    }
    else
    {
        ds.getAllRecipes().then((ObjReturn) => {
            res.render(`view`, { data: ObjReturn });
        }).catch((err) => {
            console.log(`OOPS! Something went wrong with getAllRecipes ${err}`);
            res.redirect(`/`);
        });
    }
})

//UPDATEs a recipe
app.post(`/create/update`, upload.single(`foodPhoto`), (req, res) => {
    req.body.difficulty = Number(req.body.difficulty);
    ds.UpdateRecipe(req.body).then((data) => {
        res.redirect(`/view`);
    }).catch((err) => {
        res.redirect(`/view`);
    });
})

//renders a recipe in create hbs so that user can UPDATE it (CRUD)
app.get(`/create/:id`, (req, res) => {
    ds.getOneRecipe(req.params.id).then((ObjReturn) => {
        res.render(`create`, { data: ObjReturn });
    }).catch((err) => {
        console.log(`error! could not find recipe by that ID ${err}`);
        res.render(`create`);
    });
})

//deletes a recipe by specific id
app.get(`/delete/:id`, (req, res) => {
    ds.deleteRecipe(req.params.id).then((data) => {
        res.redirect(`/view`);
    }).catch((err) => {
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
app.get(`/login`, (req, res) => {
    res.render(`login`);
})

//get login information and process it to verify if the details were correct
app.post(`/login`, (req, res) => {
    dsAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.username,
            city: user.city
        }
        res.redirect(`/`);
    }).catch((err) => {
        console.log(`error! ${err}`);
        res.redirect(`/login`);
    });
})

//sends user to signup page so user can create and POST to /signup
app.get(`/signup`, (req, res) => {
    res.render(`signup`);
})

//gets signup information and authenticates if it meets the requirements
app.post(`/signup`, (req, res) => {
    dsAuth.createUser(req.body).then((data) => {
        res.redirect(`/login`);
    }).catch((err) => {
        res.redirect(`/create`);
    })
})

app.get(`/logout`, (req,res)=>{
    req.session.reset();
    res.redirect('/');
})

let globalVar = {}; //used to tempoaraily stoe a random recipe

//displays a random recipe
app.get(`/random`,(req,res)=>{
    ds.getRandom().then((NewRecipe)=>{
        globalVar = NewRecipe;
        res.render(`random`,{
            data: NewRecipe
        });
    }).catch((err)=>{
        console.log(err);
    });
})

app.get(`/random/new`,(req,res)=>{
    ds.saveRandom(globalVar).then((msg)=>{
        console.log(msg);
        globalVar = {};
        res.redirect(`/random`);
    }).catch((err)=>{
        console.log(err);
        res.send(`could not save`)
    });
})
  
app.get(`/search`,(req,res)=>{
    res.render(`search`);
})

ds.initialize().then(() => {
    dsAuth.initialize().then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`listening on ${HTTP_PORT}`);
        });
    }).catch((err) => {
        console.log(`could not connect to Users database`);
    });
}).catch((err) => {
    console.log(`could not connect to recipe db ${err}`);
})

app.use((req, res) => {
    res.status(404).send("ERROR 404! The page your looking for does not exist!");
});
