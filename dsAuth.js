//Account information processing here
const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    "fname": {
        type: String,
        required: function() {
            /^[A-Za-z]+$/.test(this);
        },
        required: [true, "First Name Missing!"]
    },
    "lname": {
        type: String,
        required: function() {
            /^[A-Za-z]+$/.test(this);
        },
        required: false
    },
    "DoB": {
        type: Date,
        default: Date.now
    },
    "streetAddress": String,
    "city": String,
    "postal": String,
    "email": String,
    "username": {
        unique: true,
        type: String
    },
    "password": String
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let dbTwo = mongoose.createConnection("");
        dbTwo.on('error', (err) => {
            reject(err); // reject the promise with the provided error
            return;
        });
        dbTwo.once('open', () => {
            User = dbTwo.model("Users", UserSchema);
            resolve(`Successfully connected`);
            return;
        });
    });
};

module.exports.creaUser = function(GivenData) {
    let NewUser = new User(GivenData);
    return new Promise((resolve,reject)=>{
        if(GivenData.fname.length>0 && /[A-Za-z]/g.test(GivenData.fname) == true)
        {
            reject(`Characters only!`);
        }
        if(GivenData.lname.length>0 && /[A-Za-z]/g.test(GivenData.lname) == true)
        {
            reject(`Characters only!`);
        }
    })

    return NewUser.save().then((data)=>{
        return `Successfully created a new user ${data}`;
    }).catch((err)=>{
        return `Failed to create a new user ${err}`;
    });
}