const mongoose = require("mongoose");
const cateogarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }
});
module.exports = mongoose.model("Cateogary", cateogarySchema);