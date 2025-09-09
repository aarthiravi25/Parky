/* ===== PARKING APP JAVASCRIPT FUNCTIONALITY ===== */

// Global variables
let currentUser = null;
let publicParkingData = [];
let privateParkingData = [];
let currentBooking = null;
let selectedVehicleType = 'car'; // Default vehicle type (global fallback)
// Vehicle selection state per listing
const listingVehicleSelection = {}; // { [listingId]: 'bike' | 'car' | 'van' }
let selectedPaymentMethod = 'upi'; // Default payment method
let lastCreatedBookingId = null; // Track latest booking to enable cancel

// Sample data (will be replaced with Firebase data later)
const samplePublicParking = [
    {
        id: 'pub1',
        name: 'VR Mall Parking',
        location: 'Downtown, City Center',
        exactAddress: '123 Main Street, Downtown, City Center, PIN 123456',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        image: 'vr mall.jpg',
        availableSlots: 45,
        totalSlots: 100,
        type: 'public',
        rating: 4.5,
        distance: '0.5 km',
        hasStructuredParking: true,
        parkingLayout: 'park.png'
    },
    {
        id: 'pub2',
        name: 'Spencer Plaza Parking',
        location: 'Entertainment District',
        exactAddress: '456 Entertainment Ave, Entertainment District, PIN 123456',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        image: 'spencer plaza.jpg',
        availableSlots: 12,
        totalSlots: 50,
        type: 'public',
        rating: 4.2,
        distance: '1.2 km',
        hasStructuredParking: true,
        parkingLayout: 'park.png'
    },
    {
        id: 'pub3',
        name: 'Express Avenue Parking',
        location: 'Westside Mall',
        exactAddress: '789 Westside Blvd, Westside Mall, PIN 123456',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        image: 'ea.jpg',
        availableSlots: 0,
        totalSlots: 80,
        type: 'public',
        rating: 4.0,
        distance: '2.1 km',
        hasStructuredParking: true,
        parkingLayout: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
    }
];

const samplePrivateParking = [
    {
        id: 'priv1',
        name: 'Apartment Complex Parking',
        location: 'Near 123 Main Street, Downtown',
        exactAddress: '123 Main Street, Downtown, PIN 123456',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        image: 'house parking.jpg',
        pricePerHour: 50,
        securityDeposit: 500,
        type: 'private',
        rating: 4.8,
        distance: '0.8 km',
        available: true,
        hasCCTV: true,
        hasLighting: true,
        dimensions: { length: 5.0, width: 2.5, height: 2.2 },
        nearbyLandmarks: 'Near Central Mall, 200m from Main Street'
    },
    {
        id: 'priv2',
        name: 'Residential Parking Spot A',
        location: 'Near 456 Business Ave, Financial District',
        exactAddress: '456 Business Ave, Financial District, PIN 123456',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        image: 'house parking1.jpg',
        pricePerHour: 80,
        securityDeposit: 750,
        type: 'private',
        rating: 4.6,
        distance: '1.5 km',
        available: true,
        hasCCTV: false,
        hasLighting: true,
        dimensions: { length: 4.8, width: 2.3, height: 2.0 },
        nearbyLandmarks: 'Near Business Center, 200m from Financial District'
    },
    {
        id: 'priv3',
        name: 'Residential Parking Spot B',
        location: 'Near 789 Residential Blvd, Suburbs',
        exactAddress: '789 Residential Blvd, Suburbs, PIN 123456',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        image: 'house parking2.jpg',
        pricePerHour: 30,
        securityDeposit: 300,
        type: 'private',
        rating: 4.3,
        distance: '3.2 km',
        available: true,
        hasCCTV: false,
        hasLighting: false,
        dimensions: { length: 5.2, width: 2.4, height: 2.1 },
        nearbyLandmarks: 'Near Residential Area, 200m from Suburbs'
    }
];

// Page initialization
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initializeLoginPage();
            break;
        case 'signup.html':
            initializeSignupPage();
            break;
        case 'dashboard.html':
            initializeDashboard();
            // ✅ Load private parking spots when dashboard loads
            loadPrivateParking();
            break;
    }
});

// Login page functionality
function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const googleSignInBtn = document.getElementById('googleSignIn');
    const phoneOTPBtn = document.getElementById('phoneOTP');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }
    
    if (phoneOTPBtn) {
        phoneOTPBtn.addEventListener('click', handlePhoneOTP);
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    showLoadingState();
    try {
        const response = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            const user = data.user || { id: 'user', name: 'User', email };
            currentUser = { id: user.id, name: user.fullName || user.name || 'User', email: user.email, phone: user.phone || '' };
            // Persist session data consistently
            localStorage.setItem('userName', currentUser.name);
            localStorage.setItem('userId', String(currentUser.id));
            localStorage.setItem('userEmail', currentUser.email);
            localStorage.setItem('userPhone', currentUser.phone || '');
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            // Clear any old inconsistent data
            localStorage.removeItem('parkEasyUser');
            localStorage.removeItem('parkyUser');
            showAlert('Login successful!', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } else {
            showAlert(data.message || 'Login failed. Please check credentials.', 'danger');
        }
    } catch (err) {
        showAlert('Network error. Please ensure the backend is running.', 'danger');
    }
}

// Google Sign-In placeholder
function handleGoogleSignIn() {
    showAlert('Google Sign-In will be integrated with Firebase Authentication', 'info');
}

// Phone OTP placeholder
function handlePhoneOTP() {
    showAlert('Phone OTP verification will be integrated with Firebase Authentication', 'info');
}

// Signup page functionality
function initializeSignupPage() {
    const signupForm = document.getElementById('signupForm');
    const googleSignUpBtn = document.getElementById('googleSignUp');
    const phoneOTPSignUpBtn = document.getElementById('phoneOTPSignUp');
    const togglePasswordBtn = document.getElementById('togglePassword');
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', handleGoogleSignUp);
    }
    
    if (phoneOTPSignUpBtn) {
        phoneOTPSignUpBtn.addEventListener('click', handlePhoneOTPSignUp);
    }
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!fullName || !email || !phone || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (password.length < 8) {
        showAlert('Password must be at least 8 characters long', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    if (!agreeTerms) {
        showAlert('Please agree to the Terms & Conditions', 'danger');
        return;
    }
    
    showLoadingState();

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, phone, password })
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            // If backend returns user and token, persist them; otherwise just redirect to login
            if (data.user && data.token) {
                localStorage.setItem('userName', data.user.fullName || data.user.name || fullName);
                localStorage.setItem('userId', String(data.user.id));
                localStorage.setItem('userEmail', data.user.email || email);
                localStorage.setItem('userPhone', data.user.phone || phone);
                localStorage.setItem('token', data.token);
                // Clear any old inconsistent data
                localStorage.removeItem('parkEasyUser');
                localStorage.removeItem('parkyUser');
                showAlert('Account created successfully! Redirecting to dashboard...', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            } else {
                showAlert(data.message || 'Account created successfully! Redirecting to login...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            }
        } else {
            showAlert(data.message || 'Signup failed. Please try again.', 'danger');
        }
    } catch (err) {
        showAlert('Network error. Please ensure the backend is running.', 'danger');
    }
}

// Google Sign-Up placeholder
function handleGoogleSignUp() {
    showAlert('Google Sign-Up will be integrated with Firebase Authentication', 'info');
}

// Phone OTP Sign-Up placeholder
function handlePhoneOTPSignUp() {
    showAlert('Phone OTP Sign-Up will be integrated with Firebase Authentication', 'info');
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Dashboard functionality
function initializeDashboard() {
    checkUserAuthentication();
    initializeParkingData();
    setupDashboardEventListeners();
    loadParkingData();
}

// Check user authentication
function checkUserAuthentication() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    
    if (token && userName && userId) {
        currentUser = {
            id: userId,
            name: userName,
            email: localStorage.getItem('userEmail') || '',
            phone: localStorage.getItem('userPhone') || ''
        };
        updateUserInterface();
    } else {
        // Clear any inconsistent data and redirect
        localStorage.removeItem('parkEasyUser');
        localStorage.removeItem('parkyUser');
        window.location.href = 'index.html';
    }
}

// Update user interface
function updateUserInterface() {
    if (currentUser) {
        const userNameElement = document.querySelector('.navbar-nav .dropdown-toggle');
        if (userNameElement) {
            userNameElement.innerHTML = `<i class="fas fa-user-circle me-2"></i>${currentUser.name}`;
        }
        
        const welcomeName = document.getElementById('welcomeUserName');
        if (welcomeName) {
            welcomeName.textContent = currentUser.name;
        } else {
            const welcomeElement = document.querySelector('.welcome-section h2');
            if (welcomeElement) {
                welcomeElement.textContent = `Welcome back, ${currentUser.name}! 👋`;
            }
        }
    }
}

// Initialize parking data
function initializeParkingData() {
    publicParkingData = [...samplePublicParking];
    privateParkingData = [...samplePrivateParking];
}

// Setup dashboard event listeners
function setupDashboardEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const sortBy = document.getElementById('sortBy');
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    const bookingTimeSlot = document.getElementById('bookingTimeSlot');
    const customToggle = document.getElementById('customRangeToggle');
    const customStart = document.getElementById('customStartTime');
    const customEnd = document.getElementById('customEndTime');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (filterType) {
        filterType.addEventListener('change', handleFilter);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', handleSort);
    }
    
    // Do not bind sample booking handler; API handler will bind after DOM is ready
    
    if (bookingTimeSlot) {
        bookingTimeSlot.addEventListener('change', () => {
            updateTotalPrice();
            const toggle = document.getElementById('customRangeToggle');
            if (toggle && toggle.checked) {
                syncEndFromPreset();
            }
        });
    }

    if (customToggle) {
        customToggle.addEventListener('change', () => {
            const container = document.getElementById('customRangeContainer');
            if (container) container.style.display = customToggle.checked ? 'block' : 'none';
            if (customToggle.checked) {
                syncEndFromPreset();
            }
            updateTotalPrice();
        });
    }
    if (customStart) customStart.addEventListener('change', () => {
        updateTotalPrice();
        const toggle = document.getElementById('customRangeToggle');
        if (toggle && toggle.checked) {
            syncEndFromPreset();
        }
    });
    if (customEnd) customEnd.addEventListener('change', () => {
        updateTotalPrice();
        const toggle = document.getElementById('customRangeToggle');
        if (toggle && toggle.checked) {
            syncPresetFromCustom();
        }
    });
}

// ===== Preset/Custom time synchronization =====
function addMinutesToTimeString(timeStr, minutesToAdd) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    let total = h * 60 + m + minutesToAdd;
    if (total > 1439) total = 1439; // cap at 23:59
    const hh = String(Math.floor(total / 60)).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
}

function minutesDiff(startStr, endStr) {
    if (!startStr || !endStr) return 0;
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return end > start ? (end - start) : 0;
}

function isPresetHour(hours) {
    return [1, 2, 4, 8, 24].includes(hours);
}

// If custom is enabled and preset dropdown has a value and start time exists, set end accordingly
function syncEndFromPreset() {
    const toggle = document.getElementById('customRangeToggle');
    if (!toggle || !toggle.checked) return;
    const start = document.getElementById('customStartTime')?.value;
    const preset = document.getElementById('bookingTimeSlot')?.value;
    if (start && preset) {
        const end = addMinutesToTimeString(start, parseInt(preset, 10) * 60);
        const endInput = document.getElementById('customEndTime');
        if (endInput) endInput.value = end;
    }
}

// If custom is enabled and user sets start/end, try to reflect matching hours in preset dropdown
function syncPresetFromCustom() {
    const toggle = document.getElementById('customRangeToggle');
    if (!toggle || !toggle.checked) return;
    const start = document.getElementById('customStartTime')?.value;
    const end = document.getElementById('customEndTime')?.value;
    const diffMin = minutesDiff(start, end);
    const hours = diffMin > 0 ? Math.ceil(diffMin / 60) : 0;
    const select = document.getElementById('bookingTimeSlot');
    if (!select) return;
    if (isPresetHour(hours)) {
        select.value = String(hours);
    } else {
        select.value = '';
    }
}

// Load parking data
function loadParkingData() {
    displayPublicParking();
    displayPrivateParking();
}

// Display public parking
function displayPublicParking() {
    const container = document.getElementById('publicParkingContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    publicParkingData.forEach(parking => {
        const card = createPublicParkingCard(parking);
        container.appendChild(card);
    });
}

// Display private parking
function displayPrivateParking() {
    // Use new backend data loading
    if (document.getElementById('privateParkingContainer')) {
        loadPrivateParking();
    }
}

// Create public parking card
function createPublicParkingCard(parking) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    
    let statusClass = 'status-available';
    let statusText = 'Available';
    
    if (parking.availableSlots === 0) {
        statusClass = 'status-full';
        statusText = 'Full';
    } else if (parking.availableSlots < parking.totalSlots * 0.3) {
        statusClass = 'status-limited';
        statusText = 'Limited';
    }
    
    // Vehicle selection cards (per-listing state)
    const selectedType = listingVehicleSelection[parking.id] || 'car';
    const vehicleCards = `
        <div class="vehicle-selection mb-3" id="vehicleSelection-${parking.id}">
            <label class="form-label fw-semibold">Select Vehicle Type:</label>
            <div class="row g-2">
                <div class="col-4">
                    <div class="vehicle-card card p-2 text-center cursor-pointer ${selectedType === 'bike' ? 'selected' : ''}" data-vehicle="bike" onclick="selectVehicleTypeForListing('${parking.id}','bike')">
                        <i class="fas fa-motorcycle text-primary mb-1"></i>
                        <small>Bike</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="vehicle-card card p-2 text-center cursor-pointer ${selectedType === 'car' ? 'selected' : ''}" data-vehicle="car" onclick="selectVehicleTypeForListing('${parking.id}','car')">
                        <i class="fas fa-car text-primary mb-1"></i>
                        <small>Car</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="vehicle-card card p-2 text-center cursor-pointer ${selectedType === 'van' ? 'selected' : ''}" data-vehicle="van" onclick="selectVehicleTypeForListing('${parking.id}','van')">
                        <i class="fas fa-truck text-primary mb-1"></i>
                        <small>Van</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Parking layout button
    const layoutButton = parking.hasStructuredParking ? 
        `<button class="btn btn-outline-primary btn-sm mt-2" onclick="showParkingLayout('${parking.id}')">
            <i class="fas fa-map me-1"></i>View Parking Layout
        </button>` : '';
    
    // Google Maps link
    const mapLink = `<a href="https://maps.google.com/?q=${parking.coordinates.lat},${parking.coordinates.lng}" target="_blank" class="btn btn-outline-secondary btn-sm mt-2">
        <i class="fas fa-map-marker-alt me-1"></i>View on Google Maps
    </a>`;
    
    card.innerHTML = `
        <div class="card parking-card h-100">
            <img src="${parking.image}" class="card-img-top" alt="${parking.name}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${parking.name}</h5>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-text">
                    <i class="fas fa-map-marker-alt me-2 text-primary"></i>${parking.exactAddress}
                </p>
                <p class="card-text">
                    <i class="fas fa-star me-2 text-warning"></i>${parking.rating} (${parking.distance})
                </p>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <span class="text-success fw-bold">${parking.availableSlots}</span> slots available
                    </div>
                    <small class="text-muted">Total: ${parking.totalSlots}</small>
                </div>
                ${vehicleCards}
                <div class="d-flex gap-2">
                    ${layoutButton}
                    ${mapLink}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Create private parking card
function createPrivateParkingCard(parking) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    
    // Vehicle selection cards (per-listing state)
    const selectedType = listingVehicleSelection[parking.id] || 'car';
    const vehicleCards = `
        <div class="vehicle-selection mb-3" id="vehicleSelection-${parking.id}">
            <label class="form-label fw-semibold">Select Vehicle Type:</label>
            <div class="row g-2">
                <div class="col-4">
                    <div class="vehicle-card card p-2 text-center cursor-pointer ${selectedType === 'bike' ? 'selected' : ''}" data-vehicle="bike" onclick="selectVehicleTypeForListing('${parking.id}','bike')">
                        <i class="fas fa-motorcycle text-primary mb-1"></i>
                        <small>Bike</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="vehicle-card card p-2 text-center cursor-pointer ${selectedType === 'car' ? 'selected' : ''}" data-vehicle="car" onclick="selectVehicleTypeForListing('${parking.id}','car')">
                        <i class="fas fa-car text-primary mb-1"></i>
                        <small>Car</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="vehicle-card card p-2 text-center cursor-pointer ${selectedType === 'van' ? 'selected' : ''}" data-vehicle="van" onclick="selectVehicleTypeForListing('${parking.id}','van')">
                        <i class="fas fa-truck text-primary mb-1"></i>
                        <small>Van</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Static map preview removed from card; will be shown in booking modal instead
    
    // Parking dimensions button
    const dimensionsButton = `<button class="btn btn-outline-info btn-sm" onclick="showParkingDimensions('${parking.id}')">
        <i class="fas fa-ruler-combined me-1"></i>View Dimensions
    </button>`;
    
    card.innerHTML = `
        <div class="card parking-card h-100">
            <img src="${parking.image}" class="card-img-top cursor-pointer" alt="${parking.name}" onclick="showParkingDimensions('${parking.id}')">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${parking.name}</h5>
                    <span class="status-badge status-available">Available</span>
                </div>
                <p class="card-text">
                    <i class="fas fa-map-marker-alt me-2 text-primary"></i>${parking.location}
                    <small class="text-muted d-block">Exact address after payment</small>
                </p>
                <p class="card-text">
                    <i class="fas fa-star me-2 text-warning"></i>${parking.rating} (${parking.distance})
                </p>
                <div class="price-display">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price-per-hour">Price per hour:</span>
                        <span class="price-amount">₹${parking.pricePerHour}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price-per-hour">Security deposit:</span>
                        <span class="text-warning fw-bold">₹${parking.securityDeposit}</span>
                    </div>
                </div>
                ${vehicleCards}
                <div class="d-flex gap-2 mb-3">
                    ${dimensionsButton}
                </div>
                <button class="btn btn-primary w-100" onclick="openBookingModal('${parking.id}')">
                    <i class="fas fa-calendar-check me-2"></i>Book Now
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filterParkingData(searchTerm);
}

// Filter functionality
function handleFilter(event) {
    const filterType = event.target.value;
    applyFilter(filterType);
}

// Sort functionality
function handleSort(event) {
    const sortBy = event.target.value;
    applySorting(sortBy);
}

// Filter parking data
function filterParkingData(searchTerm) {
    if (!searchTerm) {
        publicParkingData = [...samplePublicParking];
        privateParkingData = [...samplePrivateParking];
    } else {
        publicParkingData = samplePublicParking.filter(parking => 
            parking.name.toLowerCase().includes(searchTerm) ||
            parking.location.toLowerCase().includes(searchTerm)
        );
        
        privateParkingData = samplePrivateParking.filter(parking => 
            parking.name.toLowerCase().includes(searchTerm) ||
            parking.location.toLowerCase().includes(searchTerm)
        );
    }
    
    displayPublicParking();
    displayPrivateParking();
}

// Apply filter
function applyFilter(filterType) {
    if (filterType === 'all') {
        publicParkingData = [...samplePublicParking];
        privateParkingData = [...samplePrivateParking];
    } else if (filterType === 'public') {
        publicParkingData = [...samplePublicParking];
        privateParkingData = [];
    } else if (filterType === 'private') {
        publicParkingData = [];
        privateParkingData = [...samplePrivateParking];
    }
    
    displayPublicParking();
    displayPrivateParking();
}

// Apply sorting
function applySorting(sortBy) {
    if (sortBy === 'distance') {
        publicParkingData.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        privateParkingData.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (sortBy === 'price') {
        privateParkingData.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'rating') {
        publicParkingData.sort((a, b) => b.rating - a.rating);
        privateParkingData.sort((a, b) => b.rating - a.rating);
    }
    
    displayPublicParking();
    displayPrivateParking();
}

// Legacy open booking modal (kept for backward compatibility)
function openBookingModalLegacy(parkingId) {
    const parking = privateParkingData.find(p => p.id === parkingId);
    if (!parking) return;
    
    currentBooking = parking;
    
    document.getElementById('modalParkingImage').src = parking.image;
    document.getElementById('modalParkingName').textContent = parking.name;
    // Show only nearby/surrounding address before payment
    document.getElementById('modalParkingLocation').textContent = parking.location;
    document.getElementById('modalPricePerHour').textContent = `₹${parking.pricePerHour}`;
    document.getElementById('modalSecurityDeposit').textContent = `₹${parking.securityDeposit}`;
    
    document.getElementById('bookingDate').value = '';
    document.getElementById('bookingTimeSlot').value = '';
    document.getElementById('modalTotalPrice').textContent = '₹0';

    // Show static map preview (approximate) in modal image area below the image
    const mapIframe = document.getElementById('parkingMap');
    const mapNote = document.getElementById('mapNote');
    if (mapNote) mapNote.textContent = 'Exact location will be shown after payment';
    
    // Show approximate map view before payment
    switchMapView(parkingId, false);
    
    const modalEl = document.getElementById('bookingModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    modalEl.addEventListener('shown.bs.modal', function onShown() {
        modalEl.removeEventListener('shown.bs.modal', onShown);
        if (spot.latitude && spot.longitude) {
            showApproximateMap(spot.latitude, spot.longitude);
        }
    });
}

// Update total price
function updateTotalPrice() {
    if (!currentBooking) return;
    
    const timeSlot = document.getElementById('bookingTimeSlot').value;
    if (!timeSlot) {
        document.getElementById('modalTotalPrice').textContent = '₹0';
        return;
    }
    
    const totalPrice = (currentBooking.pricePerHour * parseInt(timeSlot)) + currentBooking.securityDeposit;
    document.getElementById('modalTotalPrice').textContent = `₹${totalPrice}`;
}

// Handle booking confirmation
function handleConfirmBooking() {
    const bookingDate = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('bookingTimeSlot').value;
    
    if (!bookingDate || !timeSlot) {
        showAlert('Please select date and time slot', 'danger');
        return;
    }
    
    showLoadingState();
    
    setTimeout(() => {
        const pin = Math.floor(1000 + Math.random() * 9000);
        
        document.getElementById('bookingPIN').textContent = pin;
        
        const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        bookingModal.hide();
        
        const successModal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));
        successModal.show();
        
        console.log('Booking saved:', {
            parkingId: currentBooking.id,
            userId: currentUser.id,
            date: bookingDate,
            timeSlot: timeSlot,
            totalPrice: (currentBooking.pricePerHour * parseInt(timeSlot)) + currentBooking.securityDeposit,
            pin: pin,
            status: 'confirmed'
        });
        
    }, 2000);
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Show loading state
function showLoadingState() {
    const buttons = document.querySelectorAll('button[type="submit"], #confirmBookingBtn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    });
    
    setTimeout(() => {
        buttons.forEach(btn => {
            btn.disabled = false;
            if (btn.id === 'confirmBookingBtn') {
                btn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Proceed to Payment';
            } else {
                btn.innerHTML = btn.getAttribute('data-original-text') || 'Submit';
            }
        });
    }, 1500);
}

// ===== NEW FEATURES FUNCTIONS =====

// Handle vehicle type selection (per listing)
function selectVehicleTypeForListing(listingId, vehicleType) {
    listingVehicleSelection[listingId] = vehicleType;
    selectedVehicleType = vehicleType; // keep as last selected globally for convenience
    const container = document.getElementById(`vehicleSelection-${listingId}`);
    if (container) {
        container.querySelectorAll('.vehicle-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.vehicle === vehicleType);
        });
    }
    console.log(`Selected vehicle for ${listingId}:`, vehicleType);
    // TODO: Update pricing based on vehicle type if needed (Firebase rules/pricing tiers)
}

// Handle payment method selection
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI to show selected payment method
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.method === method) {
            card.classList.add('selected');
        }
    });
    
    console.log('Selected payment method:', method);
}

// Show parking layout for public parking
function showParkingLayout(parkingId) {
    const parking = publicParkingData.find(p => p.id === parkingId);
    if (!parking) return;
    
    if (parking.hasStructuredParking && parking.parkingLayout) {
        // Show structured parking layout
        const modal = new bootstrap.Modal(document.getElementById('parkingLayoutModal'));
        document.getElementById('layoutImage').src = parking.parkingLayout;
        document.getElementById('layoutTitle').textContent = parking.name;
        modal.show();
    } else {
        // Smaller mall: show total slots info and required message
        const total = typeof parking.totalSlots === 'number' ? parking.totalSlots : 'N/A';
        showAlert(`Total slots: <strong>${total}</strong><br/>Exact space but some slots only available`, 'info');
    }
}

// Show parking dimensions
function showParkingDimensions(parkingId) {
    const parking = privateParkingData.find(p => p.id === parkingId);
    if (!parking || !parking.dimensions) return;
    
    const modal = new bootstrap.Modal(document.getElementById('dimensionsModal'));
    document.getElementById('dimensionsTitle').textContent = parking.name;
    const { length, width, height } = parking.dimensions;
    // Determine recommended vehicle
    let recommended = 'Car';
    if (width <= 1.2 || length <= 2.5) {
        recommended = 'Bike';
    } else if (width >= 2.5 && length >= 5.0) {
        recommended = 'Van';
    }
    const featureBadges = [];
    if (parking.hasCCTV) featureBadges.push('<span class="me-3"><i class="fas fa-video text-success me-1"></i>CCTV available</span>');
    if (parking.hasLighting) featureBadges.push('<span class="me-3"><i class="fas fa-lightbulb text-warning me-1"></i>Lighting available</span>');
    if (width >= 2.5) featureBadges.push('<span class="me-3"><i class="fas fa-arrows-alt text-primary me-1"></i>Wider area</span>');
    if (!parking.hasCCTV && !parking.hasLighting) featureBadges.push('<span class="text-danger"><i class="fas fa-exclamation-triangle me-1"></i>Park at your own risk</span>');
    document.getElementById('dimensionsContent').innerHTML = `
        <div class="mb-3">
            ${featureBadges.join(' ')}
        </div>
        <div class="row text-center">
            <div class="col-4">
                <div class="bg-light p-3 rounded">
                    <h6>Length</h6>
                    <span class="fw-bold">${length}m</span>
                </div>
            </div>
            <div class="col-4">
                <div class="bg-light p-3 rounded">
                    <h6>Width</h6>
                    <span class="fw-bold">${width}m</span>
                </div>
            </div>
            <div class="col-4">
                <div class="bg-light p-3 rounded">
                    <h6>Height</h6>
                    <span class="fw-bold">${height}m</span>
                </div>
            </div>
        </div>
        <div class="mt-3">
            <span class="fw-semibold"><i class="fas fa-check-circle text-success me-2"></i>Recommended:</span>
            <span> ${recommended}</span>
        </div>
    `;
    modal.show();
}

// Handle KYC and vehicle details upload
function handleKYCUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('KYC document uploaded:', file.name);
        // TODO: Upload to Firebase Storage
        showAlert('KYC document uploaded successfully!', 'success');
    }
}

function handleVehicleDetailsUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('Vehicle document uploaded:', file.name);
        // TODO: Upload to Firebase Storage
        showAlert('Vehicle document uploaded successfully!', 'success');
    }
}

// Switch map view for private parking (before/after payment)
function switchMapView(parkingId, showExact = false) {
    const parking = privateParkingData.find(p => p.id === parkingId);
    if (!parking) return;
    
    const mapContainer = document.getElementById('parkingMap');
    if (showExact) {
        // Show exact location
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${parking.coordinates.lat},${parking.coordinates.lng}&zoom=18`;
        mapContainer.src = mapUrl;
        const mapLabel = document.getElementById('mapLabel');
        if (mapLabel) mapLabel.textContent = 'Location (Exact)';
        const locationText = document.getElementById('modalParkingLocation');
        if (locationText) locationText.textContent = parking.exactAddress;
        const mapNote = document.getElementById('mapNote');
        if (mapNote) mapNote.textContent = 'Showing exact address and location';
    } else {
        // Show approximate location (200m radius)
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${parking.coordinates.lat},${parking.coordinates.lng}&zoom=16`;
        mapContainer.src = mapUrl;
        const mapLabel = document.getElementById('mapLabel');
        if (mapLabel) mapLabel.textContent = 'Location (Approximate)';
        const mapNote = document.getElementById('mapNote');
        if (mapNote) mapNote.textContent = 'Exact location will be shown after payment';
    }
}

// Placeholder: Call this after backend confirms payment to reveal exact location
function revealExactLocationAfterPayment(parkingId) {
    // TODO: Replace with real payment callback (Firebase Functions / your backend webhook)
    switchMapView(parkingId, true);
}

// Process payment with selected method
function processPayment() {
    const paymentMethods = {
        'gpay': 'Google Pay',
        'phonepe': 'PhonePe',
        'upi': 'UPI',
        'card': 'Card Payment'
    };
    
    const methodName = paymentMethods[selectedPaymentMethod];
    console.log(`Processing payment via ${methodName}`);
    
    // TODO: Integrate with actual payment gateway
    showAlert(`Redirecting to ${methodName} payment gateway...`, 'info');
    
    // Simulate payment processing
    setTimeout(() => {
        showAlert('Payment successful!', 'success');
        // Switch to exact map view after payment
        if (currentBooking) {
            revealExactLocationAfterPayment(currentBooking.id);
        }
    }, 2000);
}

// Validate vehicle details form
function validateVehicleDetails() {
    const licensePlate = document.getElementById('licensePlate').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const kycFile = document.getElementById('kycUpload').files[0];
    
    if (!licensePlate || !vehicleModel || !kycFile) {
        showAlert('Please fill all vehicle details and upload KYC document', 'danger');
        return false;
    }
    
    return true;
}

// Enhanced booking confirmation with new features (LEGACY - kept for backward compatibility)
function handleConfirmBookingLegacy() {
    const bookingDate = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('bookingTimeSlot').value;
    const useCustom = document.getElementById('customRangeToggle')?.checked;
    let computedHours = timeSlot ? parseInt(timeSlot) : 0;
    if (useCustom) {
        const start = document.getElementById('customStartTime').value;
        const end = document.getElementById('customEndTime').value;
        if (!start || !end) {
            showAlert('Please select custom start and end time', 'danger');
            return;
        }
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        if (endMinutes <= startMinutes) {
            showAlert('End time must be after start time', 'danger');
            return;
        }
        computedHours = Math.ceil((endMinutes - startMinutes) / 60);
    }
    
    if (!bookingDate || (computedHours <= 0)) {
        showAlert('Please select date and time duration', 'danger');
        return;
    }
    
    // Validate vehicle details for private parking
    if (currentBooking && currentBooking.type === 'private') {
        if (!validateVehicleDetails()) {
            return;
        }
    }
    
    showLoadingState();
    
    setTimeout(() => {
        const pin = Math.floor(1000 + Math.random() * 9000);
        
        document.getElementById('bookingPIN').textContent = pin;
        
        const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        bookingModal.hide();
        
        const successModal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));
        successModal.show();
        
        // Switch to exact map view after successful booking
        if (currentBooking && currentBooking.type === 'private') {
            revealExactLocationAfterPayment(currentBooking.id);
        }
        
        console.log('Booking saved:', {
            parkingId: currentBooking.id,
            userId: currentUser.id,
            date: bookingDate,
            timeSlot: useCustom ? `custom-${computedHours}h` : timeSlot,
            vehicleType: listingVehicleSelection[currentBooking.id] || selectedVehicleType,
            paymentMethod: selectedPaymentMethod,
            totalPrice: (currentBooking.pricePerHour * computedHours) + currentBooking.securityDeposit,
            pin: pin,
            status: 'confirmed'
        });
        
    }, 2000);
}

// Update total based on preset or custom range
function updateTotalPrice() {
    if (!currentBooking) return;
    const useCustom = document.getElementById('customRangeToggle')?.checked;
    let hours = 0;
    if (useCustom) {
        const start = document.getElementById('customStartTime').value;
        const end = document.getElementById('customEndTime').value;
        if (start && end) {
            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = end.split(':').map(Number);
            const startMinutes = sh * 60 + sm;
            const endMinutes = eh * 60 + em;
            if (endMinutes > startMinutes) {
                hours = Math.ceil((endMinutes - startMinutes) / 60);
            }
        }
    } else {
        const timeSlot = document.getElementById('bookingTimeSlot').value;
        hours = timeSlot ? parseInt(timeSlot) : 0;
    }
    const total = hours > 0 ? (currentBooking.pricePerHour * hours) + currentBooking.securityDeposit : 0;
    document.getElementById('modalTotalPrice').textContent = `₹${total}`;
}

// ✅ Helper to color status badges
function getStatusColor(status) {
    if (status === "available") return "success";
    if (status === "limited") return "warning";
    return "danger"; // full
}

// ✅ Open booking modal with selected spot data
function openBookingModal(spotJSON) {
    let spot;
    
    // Handle both string (new format) and object (legacy format) inputs
    if (typeof spotJSON === 'string') {
        spot = JSON.parse(decodeURIComponent(spotJSON));
    } else {
        // Legacy format - find spot by ID
        const parkingId = spotJSON;
        spot = privateParkingData.find(p => p.id === parkingId);
        if (!spot) return;
    }
    
    currentBooking = spot;
    selectedSpotApi = spot; // Keep compatibility with existing booking system

    document.getElementById("modalParkingImage").src = spot.imageUrl || spot.image;
    document.getElementById("modalParkingName").textContent = spot.name;
    document.getElementById("modalParkingLocation").textContent = spot.location;
    document.getElementById("modalPricePerHour").textContent = `₹${spot.pricePerHour}`;
    document.getElementById("modalSecurityDeposit").textContent = `₹${spot.deposit || spot.securityDeposit}`;
    document.getElementById("modalTotalPrice").textContent = "—"; // will update after time selection

    // Example map embedding (dummy for now)
    const mapElement = document.getElementById("parkingMap");
    if (mapElement) {
        mapElement.src = `https://www.google.com/maps?q=${encodeURIComponent(spot.location)}&output=embed`;
    }

    // Show modal
    const bookingModal = new bootstrap.Modal(document.getElementById("bookingModal"));
    bookingModal.show();
}

console.log('Parky App JavaScript loaded successfully!');


// ===== CONFIG =====
const API_ORIGIN = (() => {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000`;
})();
const API_BASE = `${API_ORIGIN}/api`;
function getAuthToken() { return localStorage.getItem('token'); }

// Logout function to clear all authentication data
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('parkEasyUser');
    localStorage.removeItem('parkyUser');
    window.location.href = 'index.html';
}

// Redirect to login if not logged in and on dashboard
if (!getAuthToken() && window.location.pathname.includes('dashboard.html')) {
	window.location.href = 'index.html';
}

// ✅ Load private parking spots from backend
async function loadPrivateParking() {
    try {
        const res = await fetch(`${API_BASE}/parking-spots?type=private`);
        const spots = await res.json();

        const container = document.getElementById("privateParkingContainer");
        if (!container) return;
        container.innerHTML = ""; // clear before inserting

        spots.forEach(spot => {
            const card = document.createElement("div");
            card.className = "col-12 col-sm-6 col-lg-4 d-flex";

            const disabled = (spot.availableSlots ?? 0) <= 0;

            card.innerHTML = `
                <div class="card shadow-sm h-100 w-100">
                    <img src="${spot.imageUrl}" class="card-img-top" alt="${spot.name}">
                    <div class="card-body">
                        <h5 class="card-title">${spot.name}</h5>
                        <p class="card-text text-muted">
                            <i class="fas fa-map-marker-alt me-2"></i>${spot.location}
                            <small class="text-muted d-block">Exact address after payment</small>
                        </p>
                        <p>
                            <span class="badge bg-${getStatusColor(spot.status)}">
                                ${String(spot.status || 'available').toUpperCase()}
                            </span>
                            <span class="ms-2">${spot.availableSlots} / ${spot.totalSlots} slots</span>
                        </p>
                        <p class="mb-1"><strong>₹${spot.pricePerHour}</strong> per hour</p>
                        <p class="mb-1">Deposit: ₹${spot.deposit}</p>
                        <p class="mb-1">⭐ ${spot.rating ?? 4} | ${spot.distanceKm ?? 1} km away</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary btn-sm mt-2 view-dimensions-btn" data-id="${spot.id}">
                                <i class="fas fa-ruler-combined me-1"></i> View Dimensions
                            </button>
                            <a class="btn btn-outline-secondary btn-sm mt-2" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.location)}" target="_blank">
                                <i class="fas fa-map-marker-alt me-1"></i> View Area
                            </a>
                            <button class="btn btn-primary mt-2" ${disabled ? 'disabled' : ''}>
                                <i class="fas fa-car me-2"></i>Book Now
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const btn = card.querySelector('button.btn.btn-primary');
            if (btn && !disabled) {
                btn.addEventListener('click', () => openBookingModalFromApi(spot));
            }
            const dimBtn = card.querySelector('.view-dimensions-btn');
            if (dimBtn) {
                dimBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openDimensionsModal(spot.id);
                });
            }

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading private spots:", err);
        showAlert('Failed to load private parking spots', 'danger');
    }
}

// ===== LEGACY: Load spots from backend (keeping for compatibility) =====
async function loadPrivateSpotsFromApi() {
	try {
		const res = await fetch(`${API_BASE}/parking?type=private`);
		const spots = await res.json();
		renderPrivateCardsFromApi(spots);
	} catch (e) {
		console.error(e);
		showAlert('Failed to load private parking spots', 'danger');
	}
}

function renderPrivateCardsFromApi(spots) {
	const container = document.getElementById('privateParkingContainer');
	if (!container) return;
	container.innerHTML = '';

	spots.forEach((s) => {
		const disabled = (s.availableSlots ?? 0) <= 0;
		const badge = s.status === 'available' ? 'bg-success'
			: s.status === 'limited' ? 'bg-warning'
			: 'bg-danger';

		const col = document.createElement('div');
		col.className = 'col-12 col-sm-6 col-lg-4 d-flex';
		col.innerHTML = `
			<div class="card h-100 w-100 shadow-sm">
				<img src="${s.imageUrl || s.image || 'https://via.placeholder.com/600x300'}" class="card-img-top" alt="${s.name}">
				<div class="card-body d-flex flex-column">
					<h5 class="card-title">${s.name}</h5>
					<p class="text-muted mb-1"><i class="fas fa-map-marker-alt me-2"></i>${s.location}</p>
					<p class="mb-1"><i class="fas fa-star me-2"></i>${s.rating ?? 4} (${s.distanceKm ?? 1} km)</p>
					<span class="badge ${badge} align-self-start mb-2 text-white text-capitalize">${s.status}</span>
					<p class="mb-1"><strong>${s.availableSlots}</strong> slots available / Total: ${s.totalSlots}</p>
					<p class="mb-2">₹${s.pricePerHour}/hr · Deposit ₹${s.deposit}</p>
					<button class="btn btn-primary mt-auto" ${disabled ? 'disabled' : ''}>Book Now</button>
				</div>
			</div>
		`;
		col.querySelector('button').addEventListener('click', () => openBookingModalFromApi(s));
		container.appendChild(col);
	});
}

// ===== BOOKING MODAL (API) =====
let selectedSpotApi = null;

function openBookingModalFromApi(spot) {
	selectedSpotApi = spot;
	// Fill modal fields
	document.getElementById('modalParkingImage').src = spot.imageUrl || spot.image || '';
	document.getElementById('modalParkingName').textContent = spot.name;
	document.getElementById('modalParkingLocation').textContent = spot.location;
	document.getElementById('modalPricePerHour').textContent = `₹${spot.pricePerHour}`;
	document.getElementById('modalSecurityDeposit').textContent = `₹${spot.deposit}`;

	const today = new Date().toISOString().split('T')[0];
	const dateInput = document.getElementById('bookingDate');
	if (dateInput) {
		dateInput.min = today;
		if (!dateInput.value) dateInput.value = today;
	}

	const slotSel = document.getElementById('bookingTimeSlot');
	if (slotSel) slotSel.value = '1';
	calcApiTotal();

	const modalEl = document.getElementById('bookingModal');
	const modal = new bootstrap.Modal(modalEl);
	modal.show();

	const tryInitMap = () => {
		try {
			if (spot.latitude && spot.longitude && typeof L !== 'undefined') {
				showApproximateMap(spot.latitude, spot.longitude);
			} else if (spot.latitude && spot.longitude) {
				const m = document.getElementById('parkingMap');
				if (m) {
					m.innerHTML = `<iframe src="https://www.google.com/maps?q=${spot.latitude},${spot.longitude}&z=16&output=embed" width="100%" height="220" style="border:0" loading="lazy"></iframe>`;
					const warn = document.getElementById('approxAlert'); if (warn) warn.style.display = 'block';
					const note = document.getElementById('mapNote'); if (note) note.style.display = '';
				}
			}
		} catch (e) {
			console.error('Map init failed:', e);
		}
	};

	function onShown() {
		modalEl.removeEventListener('shown.bs.modal', onShown);
		tryInitMap();
	}
	modalEl.addEventListener('shown.bs.modal', onShown);
	setTimeout(tryInitMap, 350);
}

function calcApiTotal() {
	if (!selectedSpotApi) return;
	const hoursSel = document.getElementById('bookingTimeSlot');
	const hrs = parseInt((hoursSel?.value || '1'), 10);
	const total = (selectedSpotApi.pricePerHour || 0) * hrs + (selectedSpotApi.deposit || 0);
	const totalEl = document.getElementById('modalTotalPrice');
	if (totalEl) totalEl.textContent = `₹${total}`;
}

document.getElementById('bookingTimeSlot')?.addEventListener('change', calcApiTotal);

// ===== CONFIRM BOOKING (API) =====
(function bindApiBookingHandler() {
	const btn = document.getElementById('confirmBookingBtn');
	if (!btn) return;
	// Remove existing sample handler if present
	try { btn.removeEventListener('click', handleConfirmBookingLegacy); } catch (e) {}
	btn.addEventListener('click', async (event) => {
		event.preventDefault(); // Prevent any default form submission
		if (!selectedSpotApi) {
			alert('Error: No parking spot selected. Please try booking again.');
			return;
		}
		const licensePlate = (document.getElementById('licensePlate').value || '').trim();
		const vehicleModel  = (document.getElementById('vehicleModel').value || '').trim();
		const bookingDate   = document.getElementById('bookingDate').value;
		const hoursVal      = parseInt(document.getElementById('bookingTimeSlot').value || '1', 10);

		if (!licensePlate || !vehicleModel || !bookingDate) {
			showAlert('Please fill vehicle details and date', 'danger');
			return;
		}

		// Show loading state
		btn.disabled = true;
		btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing Payment...';
		
		// Clear any existing modal instances to prevent conflicts
		const existingModal = bootstrap.Modal.getInstance(document.getElementById('paymentSuccessModal'));
		if (existingModal) {
			existingModal.dispose();
		}

		try {
			// Simulate payment processing
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// Generate a random PIN
			const pinCode = Math.floor(1000 + Math.random() * 9000);
			
			// close booking modal
			const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
			if (bookingModal) {
				bookingModal.hide();
				console.log('Booking modal closed');
			}
			
			// show success + pin + address + maps link
			console.log('Setting PIN:', pinCode);
			document.getElementById('bookingPIN').textContent = pinCode;
			lastCreatedBookingId = 'test-booking-' + Date.now();
			
			// Display exact address and maps link
			console.log('Selected spot API data:', selectedSpotApi);
			const addr = document.getElementById('successExactAddress');
			if (addr && selectedSpotApi?.exactAddress) {
				addr.textContent = selectedSpotApi.exactAddress;
				addr.style.display = 'block';
				console.log('Setting exact address:', selectedSpotApi.exactAddress);
			} else {
				console.log('No exact address found or element not found');
			}
			const link = document.getElementById('viewOnMapsBtn');
			if (link && selectedSpotApi?.latitude && selectedSpotApi?.longitude) {
				link.href = `https://www.google.com/maps?q=${selectedSpotApi.latitude},${selectedSpotApi.longitude}`;
				link.style.display = 'inline-block';
				console.log('Setting maps link');
			}
			
			// switch to exact map view (visual confirmation)
			try {
				if (selectedSpotApi?.latitude && selectedSpotApi?.longitude) {
					showExactMap(selectedSpotApi.latitude, selectedSpotApi.longitude, selectedSpotApi.exactAddress);
				}
			} catch (e) {
				console.error('Error showing exact map:', e);
			}
			
			// Show success modal after all data is set
			const successModalEl = document.getElementById('paymentSuccessModal');
			const success = new bootstrap.Modal(successModalEl, {
				backdrop: 'static',
				keyboard: false
			});
			
			// Add event listeners to track modal behavior
			successModalEl.addEventListener('hidden.bs.modal', function() {
				console.log('Success modal was closed');
			});
			
			successModalEl.addEventListener('show.bs.modal', function() {
				console.log('Success modal is showing');
			});
			
			successModalEl.addEventListener('shown.bs.modal', function() {
				console.log('Success modal is fully shown');
			});
			
			console.log('Showing success modal...');
			
			// Add a small delay to ensure all DOM updates are complete
			setTimeout(() => {
				try {
					console.log('Attempting to show modal...');
					success.show();
					console.log('Modal show() called successfully');
					
					// Ensure modal stays open by checking after a short delay
					setTimeout(() => {
						const modalElement = document.getElementById('paymentSuccessModal');
						console.log('Modal element classes:', modalElement.classList.toString());
						if (modalElement && !modalElement.classList.contains('show')) {
							console.log('Modal was closed unexpectedly, reopening...');
							success.show();
						} else {
							console.log('Modal is still open');
						}
					}, 500);
				} catch (error) {
					console.error('Error showing modal:', error);
				}
			}, 100);
			
			// Note: Not refreshing the list immediately to avoid interfering with modal
			// The list will be refreshed when the user closes the modal or navigates away
		} catch (e) {
			console.error('=== BOOKING ERROR ===');
			console.error('Error details:', e);
			console.error('Error message:', e.message);
			showAlert('Error during booking: ' + e.message, 'danger');
		} finally {
			// Reset button state
			btn.disabled = false;
			btn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Proceed to Payment';
		}
	});
})();

// ===== DIMENSIONS / FEATURES MODAL FETCH =====
async function openDimensionsModal(spotId) {
    try {
        const res = await fetch(`${API_BASE}/parking/${spotId}/details`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const d = (data.dimensions || [])[0] || {};
        document.getElementById('vehicleType').textContent = d.vehicleType || '—';
        document.getElementById('dimensionLength').textContent = d.length ?? '—';
        document.getElementById('dimensionWidth').textContent = d.width ?? '—';
        document.getElementById('dimensionHeight').textContent = d.height ?? '—';
        const featWrap = document.getElementById('parkingFeatures');
        if (featWrap) {
            featWrap.innerHTML = (data.features || []).map(f => `
                <div class="text-center">
                    <i class="fas ${f.icon} fa-2x"></i>
                    <p class="mb-0 small">${f.type}</p>
                </div>
            `).join('');
        }
        new bootstrap.Modal(document.getElementById('dimensionsModal')).show();
    } catch (e) {
        console.error(e);
        showAlert('Failed to fetch dimensions & features', 'danger');
    }
}

// (Removed legacy confirm handler to avoid duplicate binding)

// ✅ Open Booking History Modal and Load Data
async function loadBookingHistory() {
    const authToken = getAuthToken();
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    
    if (!authToken || !userName) {
        showAlert('Please log in to view booking history', 'danger');
        return;
    }

    // Show loading state
    document.getElementById("bookingHistoryLoading").style.display = "block";
    document.getElementById("bookingHistoryContent").style.display = "none";
    document.getElementById("bookingHistoryEmpty").style.display = "none";

    try {
        // Try the authenticated endpoint first, fall back to username endpoint
        let res;
        if (userId) {
            res = await fetch(`http://localhost:5000/api/bookings/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
        
        // If that fails, try the username endpoint
        if (!res || !res.ok) {
            res = await fetch(`http://localhost:5000/api/bookings/${encodeURIComponent(userName)}`);
        }

        if (!res.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await res.json();

        // Hide loading state
        document.getElementById("bookingHistoryLoading").style.display = "none";

        if (bookings.length === 0) {
            document.getElementById("bookingHistoryEmpty").style.display = "block";
            return;
        }

        // Show content and populate table
        document.getElementById("bookingHistoryContent").style.display = "block";
        const tbody = document.getElementById("bookingHistoryTable");
        tbody.innerHTML = "";

        bookings.forEach(booking => {
            const statusBadge = getBookingStatusBadge(booking.status);
            const bookingDateFormatted = formatDate(booking.date);
            const createdAtFormatted = formatDateTime(booking.createdAt);
            const canCancel = String(booking.status || '').toLowerCase() === 'active';
            const cancelBtn = canCancel ? `<button class="btn btn-sm btn-danger" data-booking-id="${booking.id}"><i class=\"fas fa-ban me-1\"></i>Cancel</button>` : '';

            const row = `
                <tr>
                    <td>
                        <strong>${booking.parkingName}</strong><br>
                        <small class="text-muted">${booking.location || ''}</small>
                    </td>
                    <td>${bookingDateFormatted}</td>
                    <td>${booking.timeSlot}</td>
                    <td>
                        ${booking.vehicleModel}<br>
                        <small class="text-muted">${booking.licensePlate}</small>
                    </td>
                    <td><strong>₹${booking.totalPrice}</strong></td>
                    <td>
                        <span class="badge bg-secondary">${booking.pin}</span>
                    </td>
                    <td>${statusBadge}</td>
                    <td>${createdAtFormatted}</td>
                    <td>${cancelBtn}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // Bind cancel actions
        tbody.querySelectorAll('button.btn-danger[data-booking-id]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-booking-id');
                await cancelBookingById(id);
            });
        });

        // Modal is already shown by click handler; nothing to do here

    } catch (err) {
        console.error("Error loading bookings:", err);
        document.getElementById("bookingHistoryLoading").style.display = "none";
        showAlert('Could not load booking history. Please try again.', 'danger');
    }
}

// Helper function to get status badge
function getBookingStatusBadge(status) {
    switch (status?.toLowerCase()) {
        case 'active':
            return '<span class="badge bg-success">Active</span>';
        case 'completed':
            return '<span class="badge bg-primary">Completed</span>';
        case 'cancelled':
            return '<span class="badge bg-danger">Cancelled</span>';
        default:
            return '<span class="badge bg-secondary">Unknown</span>';
    }
}

// Helper function to format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

// Helper function to format date and time
function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

// ✅ Bind Booking History link in navbar
document.addEventListener('DOMContentLoaded', () => {
    const historyLink = document.getElementById('navBookingHistory');
    if (historyLink) {
        historyLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Show modal immediately with loading state
            const modalEl = document.getElementById('bookingHistoryModal');
            if (modalEl) {
                document.getElementById('bookingHistoryLoading').style.display = 'block';
                document.getElementById('bookingHistoryContent').style.display = 'none';
                document.getElementById('bookingHistoryEmpty').style.display = 'none';
                new bootstrap.Modal(modalEl).show();
            }
            loadBookingHistory();
        });
    }

    // Bind cancel button in success modal
    const cancelBtn = document.getElementById('cancelBookingBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => {
            if (!lastCreatedBookingId) {
                showAlert('No recent booking to cancel', 'warning');
                return;
            }
            await cancelBookingById(lastCreatedBookingId);
        });
    }
});

// Cancel booking helper
async function cancelBookingById(bookingId) {
    try {
        const token = getAuthToken();
        if (!token) {
            showAlert('Please log in again', 'danger');
            window.location.href = 'index.html';
            return;
        }
        const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showAlert(data.message || 'Cancel failed', 'danger');
            return;
        }
        showAlert('Booking cancelled', 'success');
        try { bootstrap.Modal.getInstance(document.getElementById('paymentSuccessModal'))?.hide(); } catch {}
        loadPrivateSpotsFromApi();
        try { await loadBookingHistory(); } catch {}
    } catch (e) {
        console.error(e);
        showAlert('Network error during cancellation', 'danger');
    }
}

// ===== Map helpers (Leaflet) =====
let leafletMap;
let leafletLayer;
let approxCircle;
let currentMarker;

function metersToDegreesLat(m) { return m / 111320; }
function metersToDegreesLng(m, lat) { return m / (111320 * Math.cos((lat * Math.PI) / 180)); }

function maskedCoords(lat, lng, radiusM = 200) {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random() * radiusM;
    const dLat = metersToDegreesLat(r * Math.sin(angle));
    const dLng = metersToDegreesLng(r * Math.cos(angle), lat);
    return { lat: lat + dLat, lng: lng + dLng };
}

function ensureMap() {
    if (!leafletMap) {
        leafletMap = L.map('parkingMap', { zoomControl: true });
        leafletLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
        }).addTo(leafletMap);
    } else {
        setTimeout(() => leafletMap.invalidateSize(), 50);
    }
}

function showApproximateMap(lat, lng) {
    ensureMap();
    const { lat: mLat, lng: mLng } = maskedCoords(lat, lng, 200);
    if (currentMarker) leafletMap.removeLayer(currentMarker);
    if (approxCircle) leafletMap.removeLayer(approxCircle);
    currentMarker = L.marker([mLat, mLng]).addTo(leafletMap);
    approxCircle = L.circle([mLat, mLng], { radius: 200 }).addTo(leafletMap);
    leafletMap.setView([mLat, mLng], 16);
    document.getElementById('mapLabel').textContent = 'Location (Approximate)';
    const note = document.getElementById('mapNote'); if (note) note.style.display = '';
    const warn = document.getElementById('approxAlert'); if (warn) warn.style.display = 'block';
    const exactDiv = document.getElementById('exactAddress'); if (exactDiv) exactDiv.style.display = 'none';
}

function showExactMap(lat, lng, exactAddress) {
    ensureMap();
    if (approxCircle) { leafletMap.removeLayer(approxCircle); approxCircle = null; }
    if (currentMarker) { leafletMap.removeLayer(currentMarker); currentMarker = null; }
    currentMarker = L.marker([lat, lng]).addTo(leafletMap);
    leafletMap.setView([lat, lng], 17);
    document.getElementById('mapLabel').textContent = 'Exact Location';
    const note = document.getElementById('mapNote'); if (note) note.style.display = 'none';
    const warn = document.getElementById('approxAlert'); if (warn) warn.style.display = 'none';
    const exactDiv = document.getElementById('exactAddress');
    if (exactDiv) {
        exactDiv.innerHTML = `<i class="fa fa-location-dot me-2"></i>${exactAddress || ''}`;
        exactDiv.style.display = 'block';
    }
}
// =================================

// ===== INIT (override sample data with API) =====
// Note: loadPrivateParking() is now called from the main DOMContentLoaded listener
