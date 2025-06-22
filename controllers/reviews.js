const Place = require('../models/place');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    // Find the place to which the review will be added
    const place = await Place.findById(req.params.id);

    // Create a new review from form data
    const review = new Review(req.body.review);
    // Assign the current user as the author of the review
    review.author = req.user._id;

    // Add review to the place's reviews array
    place.reviews.push(review);

    // Save both review and place
    await review.save();
    await place.save();

    // Flash success message and redirect back to place page
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/places/${place._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review reference from place's reviews array
    await Place.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the review document from the database
    await Review.findByIdAndDelete(reviewId);

    // Flash success message and redirect back to place page
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/places/${id}`);
};
