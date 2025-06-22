const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent routes
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync'); 
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Create a new review for a place, only logged-in users and validated input
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete a review by reviewId, only logged-in users who are the review's author
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
