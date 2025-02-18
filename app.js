require("dotenv").config();


const express = require("express")
const app = express();
const path = require('path');

const userModel = require("./models/user");
const bookmarkModel = require("./models/bookmark");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { log } = require("console");



app.set("view-engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// app.get("/",(req,res)=>{
//     res.send("hello");
// });

// app.get("/Home",(req,res)=>{
//     res.render("Home.ejs")
// })
app.get("/",(req,res)=>{
    res.render("index.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.post("/register", async(req,res)=>{
    let {email,password,username,name,age} = req.body;

    let user = await userModel.findOne({email});

    if(user) return res.status(500).send("User Already Registered");

     bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password, salt, async (err,hash)=>{
            await userModel.create({
                username,
                email,
                age,
                name,
                password: hash

            });

            // let token = jwt.sign({email: email},"shhhh");
            // // console.log(token);
            // res.cookie("token",token);
            // console.log("Registered");
            // res.send("User Registered");
            res.redirect("/login")
        });
     });

});

app.post("/login", async(req,res)=>{
    let {email,password} = req.body;

    let user = await userModel.findOne({email});

    if(!user) return res.status(500).send("Something went Wrong");

    bcrypt.compare(password, user.password,function(err,result){
        if(result){
            let token = jwt.sign({email: email,userid : user.__id},"shhhh",{
                expiresIn : 60 * 60,
            });
            // console.log(token);
            res.cookie("token",token);
            // res.status(200).send("You can Login");
            res.status(200).redirect("/All_Bookmarks");
            
        } 
        else res.redirect("/login");
    });
});

app.get("/All_Bookmarks",isLoggedIn, async(req,res)=>{
    // console.log(req.user.email);
    let user = await userModel.findOne({email: req.user.email}).populate("bookmarks");
    // user.populate("posts");
    // console.log(user);
    res.render("All_Bookmarks.ejs",{user});

});

app.post("/post",isLoggedIn, async(req,res)=>{
    // console.log(req.user.email);
    let user = await userModel.findOne({email: req.user.email});
    // console.log(user._id);

    let {title,link} = req.body;
    // console.log(content)

    let bookmark = await bookmarkModel.create({
        user: user._id,
        title: title,
        link: link
        
    });
    
    // console.log(user.__id);
    user.bookmarks.push(bookmark._id);
    await user.save();

    res.redirect("/All_Bookmarks");
    
});

app.get("/delete/:id",async (req,res)=>{
    // console.log(req.params.id);

    let bookmark = await bookmarkModel.findOne({_id: req.params.id});
    // console.log(task._id);
    let deleted_id = await bookmarkModel.findOneAndDelete({_id : req.params.id});

    let user_id = bookmark.user;

    let user = await userModel.findOne({_id: user_id});
    // console.log(user.bookmarks);


    let task_index = user.bookmarks.indexOf(req.params.id);
    // console.log(index);

    user.bookmarks.splice(task_index,1);



    
    await user.save();
    // await task.save();

    // res.send(deleted_id)
    res.redirect('back');
});

app.get("/edit/:id",async(req,res)=>{

    let bookmark = await bookmarkModel.findOne({_id : req.params.id})
    res.render("edit.ejs",{bookmark});
    
});


app.post("/update/:id",async(req,res) =>{

    let {title, link} = req.body;

    let updatetask = await bookmarkModel.findOneAndUpdate({_id: req.params.id},{title, link}, {new: true});
    
    res.redirect('/All_Bookmarks');
    // res.send();

});

app.get("/important/:id", async(req,res) =>{
    let bookmark_id = req.params.id;
    
    let bookmark = await bookmarkModel.findOne({_id: bookmark_id});
     
    
    let user = await userModel.findOne({_id: bookmark.user});
   

    if(user.Important.indexOf(bookmark_id) === -1)
    {
        user.Important.push(bookmark_id);
        if(user.UnImportant.indexOf(bookmark_id) != -1)
        {
            let index = user.UnImportant.indexOf(bookmark_id);
            user.UnImportant.splice(index,1);
        }

    }
        
    else 
    {

        user.UnImportant.push(bookmark_id);
        if(user.Important.indexOf(bookmark_id) != -1)
        {
            let index = user.Important.indexOf(bookmark_id);
            user.Important.splice(index,1);
        }
    }
    await user.save();
    
    res.redirect("back");
})

app.get("/Important_Tasks",(req,res) =>{
    res.render("Important_Tasks.ejs");
})



app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
});

app.get("/Add_Bookmark",(req,res)=>{
    res.render("Add_Bookmark.ejs");
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
    
})

// MiddleWare
function isLoggedIn(req,res,next){
    if(req.cookies.token === '') res.redirect("/login")
    // if(req.cookies.token === "") res.send("You must Logged In");

    else{
        let data = jwt.verify(req.cookies.token,"shhhh");
        req.user = data;
        next();   
    }
    
}

app.listen(process.env.PORT || 3000);
