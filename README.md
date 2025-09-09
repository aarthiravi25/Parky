# 🅿️ Parky - Smart Parking Solution

A modern web application that connects users with available parking spots in real-time. Book private and public parking spaces with ease using our intuitive interface.

![Parky Dashboard](https://img.shields.io/badge/Status-Live-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

##  Features

###  **Smart Parking Discovery**
- **Public Parking**: Find available slots in malls, plazas, and commercial areas
- **Private Parking**: Rent residential and private parking spaces
- **Real-time Availability**: Live updates on parking slot availability
- **Location-based Search**: Find parking near your destination

###  **Advanced Booking System**
- **Vehicle Type Selection**: Choose from Bike, Car, or Van options
- **Flexible Time Slots**: Book for 1, 2, 4, 8, or 24 hours
- **Custom Time Range**: Set your own start and end times
- **Secure PIN System**: Get unique access PINs for your bookings

###  **Payment Integration**
- **Multiple Payment Methods**: UPI, Google Pay, PhonePe, and Card payments
- **Security Deposits**: Refundable deposits for private parking
- **Transparent Pricing**: Clear breakdown of hourly rates and deposits

###  **Location Services**
- **Interactive Maps**: View approximate locations before booking
- **Exact Address Access**: Get precise addresses after payment confirmation
- **Google Maps Integration**: Direct navigation to your parking spot
- **Safety Features**: Approximate locations shown for security

###  **User Management**
- **Secure Authentication**: Email/password login with JWT tokens
- **User Profiles**: Manage your personal information
- **Booking History**: Track all your past and current bookings
- **Booking Management**: Cancel bookings and manage reservations

##  Technology Stack

### **Frontend**
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Bootstrap 5.3.0
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap** - Responsive UI components
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icons and visual elements

### **Backend**
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **Prisma** - Database ORM and management
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### **Database Schema**
- **Users** - User accounts and authentication
- **ParkingSpots** - Available parking locations
- **Bookings** - User reservations and history
- **ParkingFeatures** - Spot amenities and features
- **ParkingDimensions** - Vehicle compatibility data

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/parky.git
   cd parky
   ```

2. **Install backend dependencies**
   ```bash
   cd parky-backend
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:5000`

5. **Open the frontend**
   - Open `dashboard.html` in your web browser
   - Or serve it using a local server (Live Server, Python's http.server, etc.)

## 📱 Usage

### **For Users**

1. **Sign Up/Login**
   - Create an account with email and password
   - Or use the demo credentials for testing

2. **Find Parking**
   - Browse public or private parking options
   - Use filters to narrow down your search
   - View parking details, pricing, and availability

3. **Book a Spot**
   - Select your vehicle type (Bike/Car/Van)
   - Choose date and time duration
   - Fill in vehicle details and upload KYC documents
   - Select payment method and proceed

4. **Access Your Parking**
   - Receive a unique PIN for parking access
   - Get exact address and Google Maps link
   - Use the PIN to access your reserved spot

### **For Developers**

1. **API Endpoints**
   ```
   POST /signup - User registration
   POST /auth/login - User authentication
   GET /api/parking-spots - List parking spots
   POST /api/bookings - Create new booking
   GET /api/bookings/user/:id - User booking history
   ```

2. **Database Operations**
   ```bash
   npx prisma studio  # Open database GUI
   npx prisma db reset  # Reset database
   npx prisma migrate dev  # Run migrations
   ```

## 🏗️ Project Structure

```
parky/
├── 📁 parky-backend/
│   ├── 📄 server.js          # Main server file
│   ├── 📄 package.json       # Backend dependencies
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma  # Database schema
│   │   ├── 📄 seed.js        # Sample data
│   │   └── 📁 migrations/    # Database migrations
│   └── 📁 node_modules/      # Backend dependencies
├── 📄 index.html             # Login page
├── 📄 signup.html            # Registration page
├── 📄 dashboard.html         # Main application
├── 📄 profile.html           # User profile
├── 📄 script.js              # Frontend JavaScript
├── 📄 style.css              # Custom styles
├── 📁 images/                # Parking spot images
└── 📄 README.md              # This file
```

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the `parky-backend` directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

### **Database Configuration**
The app uses SQLite by default. To use a different database:
1. Update the `DATABASE_URL` in `.env`
2. Modify `schema.prisma` if needed
3. Run `npx prisma db push`

## 🧪 Testing

### **Sample Data**
The database comes pre-seeded with:
- **6 Private Parking Spots** across Chennai
- **3 Public Parking Locations** (VR Mall, Spencer Plaza, Express Avenue)
- **Sample User Accounts** for testing

### **Demo Credentials**
```
Email: demo@parky.com
Password: demo123
```

<div align="center">

**Made with ❤️ for better parking experiences**

</div>
