const dotenv = require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const authentication = require("./authentication");
const verifyuser = require("./verifyuser");
const mongoose = require('mongoose');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'))
app.set("view engine","ejs");

mongoose.connect("mongodb+srv://admin-sri:manofpower@cluster0.jztzd.mongodb.net/usersDB", {useNewUrlParser: true, useUnifiedTopology: true});
 
const store = new MongoDBStore({
   uri: "mongodb+srv://admin-sri:manofpower@cluster0.jztzd.mongodb.net/usersDB",
   collection: "mySessions",
 });

 app.use(
   session({
     secret: process.env.SECRET,
     resave: false,
     saveUninitialized: false,
     store: store,
   })
 );



app.get("/",async (req,res) => {

  res.render("home");
})



app.get("/mypage", async function(req,res){


 if(req.session.isAuth) {
    console.log(req.session);
    const user = await authentication.emailExists(req.session.email);
     if(!user[0].date_marks.length)
    {

      let marks = [];
      let date = [];
      let accuracy = [];

      let curr_date = new Date();
      let current_date = curr_date.toISOString().slice(0,10);


        res.render("mypage",{
        user:req.session.username,
        tests:user[0].date_marks.length,
        total:0,
        value:marks,
        date:date,
        accuracy:accuracy,
        current_date:current_date
      });
    }
    else
    {
      let marks = [];
      let date = [];

      let date_marks = user[0].date_marks;

      date_marks.sort((a,b) =>  {
          if ( a.date < b.date ){
            return -1;
          }
          if ( a.date > b.date){
            return 1;
          }
        return 0;
    });

    let outof_total = 0;

      marks = date_marks.map((element) => {

          outof_total += element.total;
          return element.mark;

      });

      console.log(marks);

      date = date_marks.map((element) => {

          return element.date;

      });

      let curr_date = new Date();
      let current_date = curr_date.toISOString().slice(0,10);

      console.log(outof_total);

      let correct_percentage = (user[0].totalMarks/outof_total) * 100;
      let accuracy = [correct_percentage,100-correct_percentage];


      res.render("mypage",{
        user:req.session.username,
        tests:date_marks.length,
        total:user[0].totalMarks,
        value:marks,
        date:date,
        accuracy:accuracy,
        current_date:current_date
      });

      
    }
  }
else
{
    res.redirect("/login");
}


});


app.post("/mypage",async function(req,res){
   

    console.log(req.body.date);
      console.log(req.body.mark);
      console.log(req.body.total_marks);
      const user = await authentication.emailExists(req.session.email);


      const date_marks_obj = {
        mark:parseInt(req.body.mark),
        date:req.body.date,
        total:parseInt(req.body.total_marks)
      }
      

      let check = false;
      let Index;
      let old_mark;
  
      user[0].date_marks.forEach((element,index) => {

          if(element.date === req.body.date)
             {
               check = true;
               Index = index;
               old_mark = element.mark;
             }
      });

console.log(Index);
     if(!check)
      {
        user[0].date_marks.push(date_marks_obj);
        user[0].totalMarks += date_marks_obj.mark;
      }
      else
      {
        user[0].date_marks[Index].mark = parseInt(req.body.mark);
        user[0].date_marks[Index].total = parseInt(req.body.total_marks);
        user[0].totalMarks += date_marks_obj.mark - old_mark;
        
      }
      user[0].markModified('date_marks');
      await user[0].save();
      console.log(user[0]);
      res.redirect("/mypage");

});


app.get("/signup",function(req,res){
      res.render("signup",{err:""});
});


app.post("/signup", async function(req,res){
      console.log(req.sessionID);
     const flag = await authentication.signup(req).catch(err => {
        console.log(err);
        res.render("signup",{err:"error signing up"});
     });
     console.log(flag);
     if(!flag)
        res.render("signup",{err:"email already exists"});
     else
     {
      req.session.email = req.body.email;
      req.session.username = req.body.username;
      console.log(req.session);
      res.render("login",{err:"verification email sent"});
     }
     

});

app.get("/verify", async function(req,res){

  console.log(req.session);
  if(!("email" in req.session))
    res.redirect("/login");
  else{
  const user = await authentication.emailExists(req.session.email);
    if(req.session.email && !user[0].verified)
    {
      user[0].verified = true;
      await user[0].save();
      res.render("emailVerification");
    }
    else if(req.session.email && user[0].verified)
    {
      res.redirect("/login");
    }
  }
});


app.get("/login",function(req,res){

   res.render("login",{err:""});

});



app.post("/login", async function(req,res){

   const flag = await authentication.login(req).catch(err => {
      console.log(err);
      res.render("login",{err:"error logging in"});
   });
   
   if(flag){
   console.log(flag.password);
   if(req.body.password === flag.password && flag.verified)
   {
    req.session.email = req.body.email;
    const user = await authentication.emailExists(req.session.email);
      req.session.username = user[0].username;
      req.session.isAuth = true;
      console.log(req.session.isAuth);
      console.log(req.session);
      res.redirect("/mypage");
   }
   else if(req.body.password === flag.password && !flag.verified)
   {
    error = "email not verified";
    res.render("login",{err:error});
   }
   else
   {
    error = "wrong password";
  res.render("login",{err:error});
   }
    
}
else
{
   error = "user does not exist";
  res.render("login",{err:error});
}

});



app.get("/leaderboard",async (req,res)  => {

  const members = await authentication.getTop();

  console.log(members);
  res.render("dashboard",{array:members});

})


app.get("/forgotPassword", async (req,res) => {


  res.render("forgotpassword",{err:""});
  
})

app.post("/forgotPassword", async (req,res) => {

  const user = await authentication.emailExists(req.body.email);
  if(!user)
    res.render("login",{err:"user does not exist"});
  else
  {
    const flag = await authentication.sendMail(user[0].password,req.body.email);
    res.render("login",{err:"password sent to registered email"});
  }

})


app.post("/logout",function(req,res){
    req.session.destroy((err) =>{
         if(err)
            throw err;
         res.redirect("/login");
    });

});



app.listen(process.env.PORT || 3000, function(req,res){

        console.log("Server Started");
});