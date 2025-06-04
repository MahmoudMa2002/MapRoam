const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Extension to sanitize HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// Valid values for 'type' and 'priceRange'
const validTypes = ['Camp', 'Coffee Shop', 'Restaurant', 'Tourist Spot', 'Market', 'Other'];
const validPriceRanges = ['$', '$$', '$$$', '$$$$'];

module.exports.placeSchema = Joi.object({
    place: Joi.object({
        title: Joi.string().required().escapeHTML(),
        type: Joi.string().valid(...validTypes).required(),
        location: Joi.string().required().escapeHTML(),
        priceRange: Joi.string().valid(...validPriceRanges).required(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});
