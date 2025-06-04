const express = require('express');
const router = express.Router();
const places = require('../controllers/places');
const catchAsync = require('../utils/catchAsync'); 
const { isLoggedIn, isAuthor, validatePlace } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });

router.get('/', catchAsync(places.index));

router.get('/new', isLoggedIn, places.renderNewForm);

router.post('/', isLoggedIn, upload.array('image'), validatePlace, catchAsync(places.createPlace));

router.get('/:id', catchAsync(places.showPlace));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(places.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validatePlace, catchAsync(places.updatePlace));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(places.deletePlace));

module.exports = router; 
