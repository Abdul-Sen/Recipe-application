//Account information processing here
const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    "fname": {
        type: String,
        required: function() {
            return (/^[A-Za-z]+$/.test(this.fname) && this.fname.length > 1)
        },
     //   required: [true, "First Name Missing!"]
    },
    "lname": {
        type: String,
        required: function() {
           return /^[A-Za-z]+$/.test(this.lname); //characters only, from start to end, + rep more than one occurance
        },
        required: false
    },
    "DoB": {
        type: Date,
        default: Date.now
    },
    "streetAddress": {
        type: String,
        maxlength:30
    },
    "city": {
        type: String,
        maxlength:30
    },
    "postal": {
        type: String,
        maxlength:30
    },
    "email": {
        type: String,
        maxlength:30
    },
    "username": {
        unique: true,
        type: String,
        minlength: 3,
        maxlength: 20,
        required: true
    },
    "password": {
        type: String,
        required: function() {
           return /[#$@!%&*?A-Za-z0-9]{6,}/.test(this.password); //min 6, needs a special char,cap letter, small letter, 1 number
        },
        required: true
    }
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
    //Assuming there is no password 2 to match with
    return NewUser.save().then((data)=>{
        if(data != `E11000`)
        return `Successfully created a new user ${data}`;
        else return data;
    }).catch((err)=>{
        return `Failed to create a new user ${err}`;//Might need to just return err
    });
}