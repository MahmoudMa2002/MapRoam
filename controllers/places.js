const Place = require('../models/place');
const mongoose = require('mongoose');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const ITEMS_PER_PAGE = 12;
    const page = parseInt(req.query.page) || 1;

    const totalPlaces = await Place.countDocuments({});
    const places = await Place.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

    const totalPages = Math.ceil(totalPlaces / ITEMS_PER_PAGE);

    // Convert all places to GeoJSON format
    const allPlaces = await Place.find({}); // No pagination here
    const placesGeoJSON = {
        type: 'FeatureCollection',
        features: allPlaces.map(place => ({
            type: 'Feature',
            geometry: place.geometry,
            properties: {
                popUpMarkup: `
                    <strong><a href="/places/${place._id}">${place.title}</a></strong>
                    <p>${place.type}</p>`
            }
        }))
    };

    res.render('places/index', {
        places,
        currentPage: page,
        totalPages,
        placesGeoJSON
    });
};
module.exports.renderNewForm = (req, res) => {
    res.render('places/new');
};

module.exports.createPlace = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.place.location,
        limit: 1
    }).send()
    const place = new Place(req.body.place);
    place.geometry = geoData.body.features[0].geometry
    place.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.author = req.user._id;
    await place.save();
    console.log(place);
    req.flash('success', 'Successfully made a new Pace!')
    res.redirect(`/places/${place._id}`);
};

module.exports.showPlace = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid place ID!');
        return res.redirect('/places');
    }

    const place = await Place.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');

    if (!place) {
        req.flash('error', 'Cannot find that place!');
        return res.redirect('/places');
    }

    res.render('places/show', { place });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid place ID!');
        return res.redirect('/places');
    }

    const place = await Place.findById(id);
    if (!place) {
        req.flash('error', 'Cannot find that place!');
        return res.redirect('/places');
    }

    res.render('places/edit', { place });
};

module.exports.updatePlace = async (req, res) => {
    const { id } = req.params;
    const place = await Place.findByIdAndUpdate(id, { ...req.body.place });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.images.push(...imgs);
    await place.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash('success', 'Successfully updated place!');
    res.redirect(`/places/${place._id}`);
};

module.exports.deletePlace = async (req, res) => {
    const { id } = req.params;
    await Place.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted place!');
    res.redirect('/places');
};
