const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Place = require('../models/place');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const types = ['Camp', 'Coffee Shop', 'Restaurant', 'Tourist Spot', 'Market', 'Other'];

const seedDB = async () => {
    await Place.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * cities.length);
        const priceRangeOptions = ['$', '$$', '$$$', '$$$$'];
        const place = new Place({
            author: '6835a8b0d7c16064bfd4d2ea',
            location: `${cities[randomIndex].city}, ${cities[randomIndex].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            type: sample(types),                      
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias dicta autem eius magnam impedit numquam alias doloremque veritatis dolorum qui? Consequuntur, assumenda? Minima iure tempora illum autem iusto omnis saepe.',
            priceRange: sample(priceRangeOptions),   
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomIndex].longitude,
                    cities[randomIndex].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dqcv0p9p6/image/upload/v1748956500/YelpCamp/z839us5grc9a4bfjvbds.avif',
                    filename: 'YelpCamp/qwczyjtmditlgpavjmmr',
                },
            ]
        });
        await place.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log('Database seeded and connection closed!');
});
