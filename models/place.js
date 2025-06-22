const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// Schema for images related to a place used in Cloudinary
const ImageSchema = new Schema({
    url: String,      
    filename: String  
});

// Property to generate a smaller thumbnail version of the image URL
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// Enable virtuals when converting documents to JSON (e.g., for API responses)
const opts = { toJSON: { virtuals: true } };

// Main Place schema definition
const PlaceSchema = new Schema({
    title: String,    
    type: {
        type: String,
        enum: ['Camp', 'Coffee Shop', 'Restaurant', 'Tourist Spot', 'Market', 'Other'], // Allowed place types
        required: true
    },
    images: [ImageSchema],
    geometry: {             // GeoJSON data for map location
        type: {
            type: String,
            enum: ['Point'],  // Must be 'Point' for GeoJSON
            required: true
        },
        coordinates: {
            type: [Number],  // Array of [longitude, latitude]
            required: true
        }
    },
    priceRange: String,   
    description: String,  
    location: String,     
    author: {             // Reference to the User who created this place
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [            // Array of references to Review documents
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// Virtual property to generate HTML markup for map popups
PlaceSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/places/${this._id}">${this.title}</a></strong>
    <p>${this.type}</p>`;
});

// Middleware that runs after a place is deleted via findOneAndDelete
// Deletes all associated reviews from the Review collection
PlaceSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

// Export the Place model
module.exports = mongoose.model('Place', PlaceSchema);
