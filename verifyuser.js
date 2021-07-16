const authentication = require("./authentication");


const verify = {
user:"",
marks:[],
async verifyuser(req) {

    console.log(req.body);
    if(req.body.token === "token12345678910")
    {
       this.user = "smuma7@gmail.com";
       return true;
    }
       
    else
       return false;
},

async getMarks(){

  let marks = await authentication.getMarks(this.user);
  console.log("marks array"+marks[0].marks.length);
  marks = marks[0].marks;
  this.marks = marks;
  console.log("newly set "+this.marks);
 return true;
}

}

module.exports = verify;