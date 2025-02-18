require("dotenv").config();

const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/BookMark_Manager");
mongoose.connect(process.env.MONGODB_URI);

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookmark"
        }
    ],
    Important: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookmark"
        }
    ],
    UnImportant: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookmark"
        }
    ],
});

module.exports = mongoose.model('user',userSchema);