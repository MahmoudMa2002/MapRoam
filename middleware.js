const { placeSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Place = require('./models/place');
const Review = require('./models/review');
const { reviewSchema } = require('./schemas.js');

// Middleware to check if a user is logged in
//- If not authenticated, store the URL they were trying to access (req.originalUrl) so we can redirect them back after login.
//- Flash an error message and redirect them to the login page.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // store attempted URL
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next(); // continue if logged in
};

// Middleware to store the "returnTo" value in locals
//- This makes it accessible in views (like after login redirect)
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// Middleware to validate incoming place data with Joi
//- Validates req.body against the placeSchema
//- If invalid, throw a custom ExpressError with status 400
module.exports.validatePlace = (req, res, next) => {
    const { error } = placeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next(); // continue if valid
    }
};

// Middleware to check if the logged-in user is the author of a place 
//- Fetches the place by ID
//- Compares place.author with req.user._id
//- If not the same, deny permission and redirect back
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/places/${id}`);
    }
    next();
};

// Middleware to check if the logged-in user is the author of a review
//- Fetches the review by reviewId
//- Compares review.author with req.user._id
//- If not the same, deny permission and redirect back
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/places/${id}`);
    }
    next();
};

// Middleware to validate incoming review data with Joi
//- Validates req.body against the reviewSchema
//- If invalid, throw a custom ExpressError with status 400
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next(); // continue if valid
    }
};
