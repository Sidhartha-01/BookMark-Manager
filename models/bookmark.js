const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/Posting_App");

const bookSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: String,
    link: String,
    Flag_Important: Number,
    
   
});

module.exports = mongoose.model('bookmark',bookSchema);