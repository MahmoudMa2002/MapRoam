const Place = require('../models/place');
const mongoose = require('mongoose');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    // Number of places to show per page
    const ITEMS_PER_PAGE = 12;
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1

    // Count total number of places in DB
    const totalPlaces = await Place.countDocuments({});
    // Fetch places for current page with pagination
    const places = await Place.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalPlaces / ITEMS_PER_PAGE);

    // Prepare GeoJSON data for map rendering (Mapbox)
    const placesGeoJSON = {
        type: 'FeatureCollection',
        features: places.map(place => ({
            type: 'Feature',
            geometry: place.geometry,
            properties: {
                popUpMarkup: `
                    <strong><a href="/places/${place._id}">${place.title}</a></strong>
                    <p>${place.type}</p>`
            }
        }))
    };

    // Render the index view with places, pagination info and GeoJSON data
    res.render('places/index', {
        places,
        currentPage: page,
        totalPages,
        placesGeoJSON
    });
};

module.exports.renderNewForm = (req, res) => {
    // Render form to create a new place
    res.render('places/new');
};

module.exports.createPlace = async (req, res, next) => {
    // Use Mapbox geocoding to get coordinates for the location entered
    const geoData = await geocoder.forwardGeocode({
        query: req.body.place.location,
        limit: 1
    }).send();

    // Create a new place document from the form data
    const place = new Place(req.body.place);
    // Assign the GeoJSON geometry from Mapbox response
    place.geometry = geoData.body.features[0].geometry;
    // Map uploaded files info to place images array
    place.images = req.files.map(f => ({
        url: f.path.replace('/upload/', '/upload/q_auto,f_auto/'), // Optimize URL for Cloudinary
        filename: f.filename
    }));
    // Set the author to the current logged-in user
    place.author = req.user._id;
    await place.save();

    // Flash success message and redirect to the new place's detail page
    req.flash('success', 'Successfully made a new Place!');
    res.redirect(`/places/${place._id}`);
};

module.exports.showPlace = async (req, res) => {
    const { id } = req.params;

    // Validate that the provided id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid place ID!');
        return res.redirect('/places');
    }

    // Find place by ID and populate associated reviews and authors
    const place = await Place.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');

    if (!place) {
        req.flash('error', 'Cannot find that place!');
        return res.redirect('/places');
    }

    // Render the detailed show page for the place
    res.render('places/show', { place });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    // Validate place ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid place ID!');
        return res.redirect('/places');
    }

    // Find place to edit
    const place = await Place.findById(id);
    if (!place) {
        req.flash('error', 'Cannot find that place!');
        return res.redirect('/places');
    }

    // Render the edit form pre-filled with place data
    res.render('places/edit', { place });
};

module.exports.updatePlace = async (req, res) => {
    const { id } = req.params;

    // Update place with new form data
    const place = await Place.findByIdAndUpdate(id, { ...req.body.place });

    // Add any newly uploaded images to the images array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.images.push(...imgs);
    await place.save();

    // Delete images from Cloudinary and MongoDB if requested
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    // Flash success message and redirect to updated place page
    req.flash('success', 'Successfully updated place!');
    res.redirect(`/places/${place._id}`);
};

module.exports.deletePlace = async (req, res) => {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (place) {
        // Delete all images from Cloudinary
        for (let image of place.images) {
            await cloudinary.uploader.destroy(image.filename);
        }

        // Delete the place document from DB
        await Place.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted place!');
    } else {
        req.flash('error', 'Place not found!');
    }

    res.redirect('/places');
};

