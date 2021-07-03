const express = require("express");
const signup = require("./signup");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post("/", function(req,res){
      
     res.send("success");

});

app.listen(3000, function(req,res){

        console.log("Server Started");
});