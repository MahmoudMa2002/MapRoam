const User = require('../models/user'); 

// Render the registration form page
module.exports.renderRegister = (req, res) => {
    res.render('users/register'); 
};

// Handle user registration form submission
module.exports.register = async (req, res) => {
    try {
        // Extract user data from the request body
        const { email, username, password } = req.body;

        // Create a new User instance (without password)
        const user = new User({ email, username });

        // Register the user with the password (hashes and saves user)
        const registeredUser = await User.register(user, password);

        // Automatically log in the user after registration
        req.login(registeredUser, err => {
            if (err) return next(err); 

            // Flash success message and redirect to places page
            req.flash('success', 'Welcome to JoCamp!');
            res.redirect('/places');
        });
    } catch (e) {
        // If error occurs, flash error message and redirect back to register form
        req.flash('error', e.message);
        res.redirect('register');
    }
};

// Render the login form page
module.exports.renderLogin = (req, res) => {
    res.render('users/login'); 
};

// Handle user login success
module.exports.login = (req, res) => {
    // Flash success message after login
    req.flash('success', 'Welcome back!');

    // Redirect to the originally requested page or default to /places
    const redirectUrl = res.locals.returnTo || '/places';
    res.redirect(redirectUrl);
};

// Handle user logout
module.exports.logout = (req, res, next) => {
    // Passport's logout method with callback for error handling
    req.logout(function (err) {
        if (err) {
            return next(err);
        }

        // Flash goodbye message and redirect to places page
        req.flash('success', 'Goodbye!');
        res.redirect('/places');
    });
};
