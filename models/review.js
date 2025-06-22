const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Review schema
const reviewSchema = new Schema({
    body: String,   
    rating: Number, 
    author: {       
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Export the Review model
module.exports = mongoose.model("Review", reviewSchema);
