const express = require('express');
const router = express.Router();
const places = require('../controllers/places');
const catchAsync = require('../utils/catchAsync'); 
const { isLoggedIn, isAuthor, validatePlace } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); // Multer configured to use Cloudinary storage

// Show all places
router.get('/', catchAsync(places.index));

// Show form to create a new place (only if logged in)
router.get('/new', isLoggedIn, places.renderNewForm);

// Handle creation of new place, uploading multiple images, validating input, only if logged in
router.post('/', isLoggedIn, upload.array('image'), validatePlace, catchAsync(places.createPlace));

// Show details for a specific place by id
router.get('/:id', catchAsync(places.showPlace));

// Show edit form for a place, only if logged in and user is the author
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(places.renderEditForm));

// Handle update of a place, upload new images, validate input, only author can update
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validatePlace, catchAsync(places.updatePlace));

// Delete a place by id, only author can delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(places.deletePlace));

module.exports = router;
