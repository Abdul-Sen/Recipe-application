const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

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
        let db = mongoose.createConnection("");
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
        let newRecipe = new Recipe(jsonData);
        newRecipe.save()
        .then(saved => resolve(`saved new recipe`))
        .catch(err => reject(`failed to save new recipe`));
    })
};

