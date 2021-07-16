const mongoose = require("mongoose");
const mailer = require("./mailer");

const userSchema = new mongoose.Schema({
    username:String,
    email: String,
    password: String,
    date_marks: Array,
    totalMarks: Number,
    verified: Boolean
});

const user = new mongoose.model("user", userSchema);


exports.signup = async (request) => {

    const email = request.body.email;
    const password = request.body.password;
    const username = request.body.username;

    const person = {
        username: username,
        email: email,
        password: password,
        date_marks:[],
        totalMarks: 0,
        verified: false
    }

    flag = await this.emailExists(email);

    if(flag.length)
        return false;

    const new_user = new user(person);
    console.log(new_user);
    new_user.save();
    
    let url="192.168.0.140:3000/verify";

    try{
        flag2 = await mailer.sendEmail({

            subject: "Verification email",
            to: email,
            html: "<h2>Welcome to SUPER 30 Clan!</h2><a href='https://super-30.herokuapp.com/verify'>click here</a>"
    });
    }
    catch (err) {
        console.log(err);
    }
    if(flag2)
        console.log("successfully sent verification email");
    else
        console.log("failed to send verification email");

    return true;

}

exports.login = async (request) => {

    const email = request.body.email;
    const password = request.body.password;

    flag = await this.emailExists(email);
    console.log(flag);
    if(flag)
        return flag[0];

    return false;

}

exports.emailExists = async (email) => {

    return user.find({ email: {$eq: email}}, function(error, results){
        if(error)
            console.log(error);
        else
        {
            console.log(results);
        }
            
    });

}

exports.getMarks = async (email) => {


    answer = await user.find({ email: {$eq: email}}, function(error, results){
        if(error)
            console.log(error);
        else
        {
            console.log(results[0]);
        }
            
    });
    
    console.log(answer);
    return answer;

}

exports.getTop = async () => {

    members = await user.find({},null,{skip:0,limit:10,sort:{totalMarks: "desc"}},(err, docs) => {

        console.log(err);
    });

    return members;
}

exports.sendMail = async (password, email) => {

    try{
        flag2 = await mailer.sendEmail({

            subject: "User Credentials",
            to: email,
            html:"<p>Your password is"+password+"</p>"
    });
    }
    catch (err) {
        console.log(err);
    }
    if(flag2)
        console.log("successfully sent verification email");
    else
        console.log("failed to send verification email");

    return true;

}