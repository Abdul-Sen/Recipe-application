const fetch = require(`node-fetch`);
const mongoose = require(`mongoose`);
require('dotenv').config();


const Schema = mongoose.Schema;
const fs = require(`fs`);

var RecipeSchema = new Schema({
    "name": String,
    "difficulty": Number,
    "directions": String,
    "ingredients": [
        String
    ],
    "filename": {
        type: String,
        unique: true
    }
});

let Recipe; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.DB_STRING);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
            return;
        });
        db.once('open', () => {
            Recipe = db.model("Recipes", RecipeSchema);
            resolve(`Successfully connected`);
            return;
        });
    });
};

module.exports.addRecipe = function (jsonData) {
    return new Promise((resolve, reject) => {

        //removing any empty data array element
        for (let i = 0; i < jsonData.ingredients.length; i++) {
            if (jsonData.ingredients[i].length < 1) {
                jsonData.ingredients.splice(i, 1);
            }
        }
        let newRecipe = new Recipe(jsonData);
        newRecipe.save()
            .then(saved => resolve(`saved new recipe`))
            .catch(err => reject(`failed to save new recipe`));
    })
};

module.exports.getAllRecipes = function () {
    return new Promise((resolve, reject) => {
        Recipe.find().exec().then((data) => {
            resolve(data);
            return;
        }).catch((err) => {
            reject(err);
            return;
        });
    })
}

module.exports.getOneRecipe = function (RecipeID) {
    return new Promise((resolve, reject) => {
        Recipe.findById(RecipeID, (err, result) => {
            if (err) {
                reject(`Could not find recipe by that ID ${err}`);
                return;
            }
            resolve(result);
            return;
        })
    })
}

module.exports.getRecipeByDifficulty = function (DiffNum) {
    return Recipe.find({ difficulty: DiffNum }).exec().then((data) => {
        return data;
    }).catch((err) => {
        console.log(`could not find by difficulty ${err}`);
        return err;
    });
}

module.exports.UpdateRecipe = function (jsonData) {

    //removing any empty data array element
    for (let i = 0; i < jsonData.ingredients.length; i++) {
        if (jsonData.ingredients[i].length < 1) {
            jsonData.ingredients.splice(i, 1);
        }
    }
    return Recipe.findOneAndUpdate({ _id: jsonData._id }, jsonData, { upsert: false }).exec().then((data) => {
        return data;
    }).catch((err) => {
        return `error occured ${err}`;
    });
}

module.exports.deleteRecipe = function (ui_id) {
    return Recipe.remove({ _id: ui_id }).exec().then((data) => {
        return `Recipe REMOVED ${data}`;
    }).catch((err) => {
        return `Recipe NOT removed! ${err}`;
    });
}


/************************************
 * MEAL API INTERACTION STARTS HERE 
 * **********************************/

//gets a random recipe
module.exports.getRandom = function () {
    return fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(res => res.json())
        .then(body => {
            //Filtering ingreidents
            let ingredientsArr = [];
            console.log(body);
            for (let KEY in body.meals[0]) {
                if (KEY.substr(0, 13) == "strIngredient" && (body.meals[0][KEY] != "" && body.meals[0][KEY] != null)) {
                    ingredientsArr.push(body.meals[0][KEY]);
                }
            }
            console.log(ingredientsArr);
            //setting difficulty
            if(ingredientsArr.length<3)
            {
                body.meals[0].difficulty = 0;
            }
            else if(ingredientsArr.length<6)
            {
                body.meals[0].difficulty = 1;
            }
            else if(ingredientsArr.length<9)
            {
                body.meals[0].difficulty = 2;
            }
            else if(ingredientsArr.length<12)
            {
                body.meals[0].difficulty = 3;
            }
            else if(ingredientsArr.length<15)
            {
                body.meals[0].difficulty = 4;
            }
            else{
                body.meals[0].difficulty = 5;
            }

            //creating a new recipe to display, not saving
            let newRecipe = new Recipe({
                name: body.meals[0].strMeal,
                difficulty: body.meals[0].difficulty,
                directions: body.meals[0].strInstructions,
                ingredients: ingredientsArr,
                filename: body.meals[0].strMealThumb //just use it to display right now, once user says "save", then download the image and save it
            });
            return newRecipe;
        }).catch((err) => {
            console.log(`oops! an error occured! ${err}`);
            return err;
        });
}

module.exports.saveRandom = function (obj) {
    return new Promise((resolve, reject) => {
        let imgName = obj.filename;
        imgName = imgName.substr(imgName.lastIndexOf(`/`) + 1); //searches the last place where '/' is preasent and gets its index, then uses substr to cut until that point

        fetch(obj.filename) //downloading image from the URL
            .then(res => {
                const dest = fs.createWriteStream(`./public/images/${imgName}`);
                res.body.pipe(dest);
            });

        obj.filename = imgName;
        obj.save()
            .then((saved) => {
                resolve(`saved new recipe`)
                return;
            })
            .catch((err) => {
                console.log(err);
                reject(`failed to save new recipe`)
                return;
            });
    })
}