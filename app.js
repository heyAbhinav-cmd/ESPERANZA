const express= require("express");
const app=express();
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

require("dotenv").config();
const encrypt=require("mongoose-encryption");
var login = false;
/* Connects to Database*/
const mongoose =require("mongoose");
const strUrl="mongodb://127.0.0.1:27017/secretsDB";
mongoose.connect(strUrl, {useNewURLParser:true, useUnifiedTopology: true });
console.log("##### Successfully Connected to secretsDB");
   
    
    const userSchema=new mongoose.Schema({
        username: String,
        usermail: String,
        phonenum: Number,
        password:String
    });
    const appointmentSchema=mongoose.Schema({
        username: String,
        usermail : String,
        userphone : Number,
        datestart : Date,
        dateend : String,
        department : String,
        message : String
    })
    const contactSchema=mongoose.Schema({
        username: String,
        usermail : String,
        subject : String,
        message : String});
    const encryptionKey="specifyYourLongStringHere"; 
   
   
    userSchema.plugin(encrypt, {secret:encryptionKey, encryptedFields: ['password']});
    
    const userModel= mongoose.model("user", userSchema); 
    const userAppointment = mongoose.model("userAppointment", appointmentSchema);
    const userContact = mongoose.model("Contacts", contactSchema);
/*The codes below direct to home page on address: localhost:3000
*/
app.get("/", function(req,res){
    res.render("home1",{contactInfos : false,appointmentSuccess:false,LoginSuccess:login});
});

/*The codes below direct to login page on address: localhost:3000/login
*/
app.get("/login", function(req,res){
    res.render("login");
});

/*The codes below direct to register page on address: localhost:3000/register
*/
app.get("/register", function(req,res){
    res.render("register",{userFound:false});
});

/*The codes below specify what to do when user access: localhost:3000/register using POST method
*/
app.post("/register", async(req,res)=>{
    var strName=req.body.username; 
    var strmail=req.body.usermail; 
    var phonenum=req.body.phonenum; 
    var strPassword=req.body.password;
    var userNew=new userModel({ 
        username:strName,
        usermail:strmail,
        phonenum:phonenum,
        password:strPassword
    });
    try{
        let usersMailFound = await userModel.findOne({usermail:strmail})
        // console.log(usersMailFound)
        if(usersMailFound != null){
            if(usersMailFound.usermail == strmail){
                console.log("##### user already exists =" + userNew.username)
                res.render("register",{userFound :userNew.username})
            }
        }else{
            userNew.save();
            login = userNew.username;
            console.log("##### Successfully added a new user =" + userNew.username +" pass: " +userNew.password);
            res.render("home1",{contactInfos : false,appointmentSuccess:false,LoginSuccess:login});
        }
    }catch (err){
        console.log("##### Error when registering error= " + err);
    }
});
app.post("/appointment", (req, res) => {
    const userName = req.body.name;
    const userMail = req.body.email;
    const phoneNumber = req.body.phone;
    const dateStart = req.body.date1;
    const dateEnd = req.body.date2;
    const department = req.body.department;
    const message = req.body.message;

    let userAppointments = new userAppointment({
        username : userName,
        usermail : userMail,
        userphone : phoneNumber,
        datestart : dateStart,
        dateend : dateEnd,
        department : department,
        message : message        
    })
    try {
        userAppointments.save()
        console.log('successfully saved userAppointment')
        res.render("home1",{appointmentSuccess : true ,contactInfos :false,LoginSuccess:login})
    } catch (error) {
        console.log(error)
    }
}
)
app.post('/contact',(req, res)=>{
    let userName = req.body.name;
    let userEmail = req.body.email;
    let subjectReq = req.body.subject;
    let messageReq = req.body.message;
    let contactInfo = new userContact({
        username: userName,
        usermail : userEmail,
        subject : subjectReq,
        message : messageReq
    })
    let contactInfos = false;
    try{
        contactInfo.save();
        contactInfos = true;
        console.log("Request made successfully");
        res.render('home1',{contactInfos : true,appointmentSuccess : false,LoginSuccess:login})
        // res.redirect('#contact');
    }catch (error) {
        // let contactInfos = false;
        console.log('error getting contact information')
    }
})
app.post("/login", async(req,res)=>{
    var strUsername=req.body.username; // getting the value sent by the form especially text: username
    var strPassword=req.body.password;// getting the value sent by the form especially text: password
    try{
        var userFound= await userModel.findOne({username:strUsername});//find the user wit that password
        // console.log(userFound.password,strPassword)
        if (userFound !=null){
            if (userFound.password== strPassword){
                console.log("#####Login successful!");
                login = userFound.username;
                res.render('home1',{contactInfos : false,appointmentSuccess : false,LoginSuccess : login})
                // res.render("home1");
            }else{
                console.log("#####Login failed");
            }
        }else{
            console.log("#####Login failed. No matching username and password");
            res.render("login");
        }
    }catch(err){
        console.log("##### Error when logging in = " + err);
    }
});

/* Lets the server listen to port 3000 on local host */
app.listen(3000,()=>{
    console.log("listening on port http://localhost:3000/");
});