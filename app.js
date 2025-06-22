// Load environment variables from .env file (only in development)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Core dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // For EJS layouts
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError'); // Custom error class
const methodOverride = require('method-override'); // Allows PUT/DELETE in forms
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet'); // Adds security-related HTTP headers
const mongoSanitize = require('express-mongo-sanitize'); // Prevent MongoDB operator injection

// Routes
const userRoutes = require('./routes/users');
const placesRoutes = require('./routes/places');
const reviewsRoutes = require('./routes/reviews');

// MongoDB connection string from environment variable
const dbUrl = process.env.DB_URL;

// Mongo session store
const MongoStore = require('connect-mongo');

// Connect to MongoDB
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// Set up view engine and views folder
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Allows overriding methods with ?_method=DELETE or PUT
app.use(methodOverride('_method'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Sanitize user input to prevent MongoDB operator injection (e.g., $gt)
app.use(mongoSanitize({
    replaceWith: '_',
}));

// Configure session store in MongoDB
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // Session will only be updated once every 24 hrs
    crypto: {
        secret: 'thisshouldbeabettersecret!' // Used to encrypt session data
    }
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e);
});

// Session configuration
const sessionConfig = {
    store,
    name: 'wsg', // Custom session cookie name
    secret: process.env.SESSION_SECRET || 'fallbacksecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Prevents client-side JS access
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet()); // Add secure headers

// Allow specific trusted sources in Content Security Policy copied from colt's code
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://cdnjs.cloudflare.com/",
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dqcv0p9p6/", // Your Cloudinary account
            "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));

// Passport authentication setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Local login strategy
passport.serializeUser(User.serializeUser());         // Serialize user to session
passport.deserializeUser(User.deserializeUser());     // Deserialize from session

// Flash messages and current user available in all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Use route modules
app.use('/', userRoutes);
app.use('/places', placesRoutes);
app.use('/places/:id/reviews', reviewsRoutes);

// Catch-all route for undefined URLs
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
