# MapRoam

**Live Demo**: [Visit MapRoam on Render](https://jomap.onrender.com)

---

## Project Background

MapRoam is a full-stack location discovery app originally inspired by the YelpCamp concept from Colt Steele’s Web Developer Bootcamp. It has been expanded into a versatile platform supporting a variety of place types (e.g., coffee shops, tourist spots), a modern responsive UI, and interactive category-based filtering.

---

## Features

- **User Authentication**: Secure login and registration system with Passport.js.
- **User Authorization**: Role-based access allowing users to manage only their own locations and reviews.
- **Map Integration**: Interactive maps to browse and discover locations.
- **Location Listings**: Users can add, edit, and delete places.
- **Category Filtering**: Filter places by type (e.g., camp, coffee shop, tourist attraction).
- **Image Uploads**: Upload photos for each location using Cloudinary.
- **Reviews and Ratings**: Users can leave and delete feedback on locations.
- **Responsive Design**: Works well on desktop, tablet, and mobile devices.

---

## Technologies Used

### Frontend
- HTML, CSS, JavaScript, Bootstrap
- EJS Templating Engine
- Mapbox GL JS 

### Backend
- Node.js
- Express.js
- Joi 

### Database
- MongoDB with Mongoose

### Authentication
- Passport.js

### File Uploads & Hosting
- Multer 
- Cloudinary
- Multer-Storage-Cloudinary

###  Deployment & Environment
- render

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MahmoudMa2002/MapRoam.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd MapRoam
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:  
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SESSION_SECRET=your_session_secret
   ```

5. **Start the application**:
   ```bash
   npm start
   ```

6. **Access the application locally**:  
   Open your browser and navigate to `http://localhost:3000`

---

## Folder Structure

- `controllers/` - Route handlers and business logic
- `models/` - Mongoose schemas and models
- `routes/` - Express route definitions
- `views/` - EJS templates for rendering pages
- `public/` - Static assets like CSS, JS, and images
- `uploads/` - Temporary storage for uploaded files
- `utils/` - Utility functions and middleware
- `seeds/` - Database seeding scripts

---

## Acknowledgments

- [Cloudinary](https://cloudinary.com/) for image hosting
- [MongoDB](https://www.mongodb.com/) for the database solution
- [Passport.js](http://www.passportjs.org/) for authentication
- [Colt Steele](https://www.udemy.com/course/the-web-developer-bootcamp/) for the original YelpCamp inspiration
- [Render](https://render.com/) for deployment

---

*This project  was built independently while following Colt Steele’s [`The Web Developer Bootcamp`] course to gain hands-on experience with full-stack web development.*
