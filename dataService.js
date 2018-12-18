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

        //removing any empty data array element
        for (let i = 0; i < jsonData.ingredients.length; i++) {
            if (jsonData.ingredients[i].length < 1) {
                console.log(jsonData.ingredients[i])
                jsonData.ingredients.splice(i, 1);
                console.log(jsonData.ingredients);
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

module.exports.UpdateRecipe = function (jsonData) {
    console.log(typeof jsonData);
    Recipe.update(
        { _id : jsonData._id },
        { $set: { this : jsonData } },
        { multi: false }
    ).exec().then((data) => {
        resolve(data[0]);
    }).catch((err) => {
        reject(`There was an error veryfying the user : ${err}`);
    });
}
      
    //     Recipe.updateOne({_id: jsonData._id}, {$set: {this : jsonData}}).exec().
    // }
//     return new Promise((resolve, reject) => {
//         // console.log(`inside update recipe<>>> Recived jsondata: ${jsonData}`);
//         Recipe.updateOne(
//             { _id: jsonData._id },
//             { $set: { this: jsonData } }
//         ).exec().
//             then((response) => {
//                 resolve(response);
//                 return;
//             }).catch((err) => {
//                 reject(err);
//                 return;
//             });
//     })
// }

