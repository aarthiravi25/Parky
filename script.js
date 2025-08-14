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
        hasStructuredParking: false,
        parkingLayout: null
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
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    showLoadingState();
    
    setTimeout(() => {
        currentUser = {
            id: 'user123',
            name: 'Alice',
            email: email,
            phone: '+1234567890'
        };
        
        if (rememberMe) {
            localStorage.setItem('parkEasyUser', JSON.stringify(currentUser));
        }
        
        window.location.href = 'dashboard.html';
    }, 1500);
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
function handleSignup(event) {
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
    
    setTimeout(() => {
        currentUser = {
            id: 'user' + Date.now(),
            name: fullName,
            email: email,
            phone: phone
        };
        
        showAlert('Account created successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 1500);
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
    const savedUser = localStorage.getItem('parkEasyUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // Normalize placeholder name to Alice if previously saved as John Doe
        const nameLower = (currentUser?.name || '').trim().toLowerCase();
        if (nameLower === 'john doe') {
            currentUser.name = 'Alice';
            try {
                localStorage.setItem('parkEasyUser', JSON.stringify(currentUser));
            } catch (e) {
                console.warn('Could not update localStorage user name:', e);
            }
        }
        updateUserInterface();
    } else {
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
    
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', handleConfirmBooking);
    }
    
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
    const container = document.getElementById('privateParkingContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    privateParkingData.forEach(parking => {
        const card = createPrivateParkingCard(parking);
        container.appendChild(card);
    });
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

// Open booking modal
function openBookingModal(parkingId) {
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
    
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
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

// Enhanced booking confirmation with new features
function handleConfirmBooking() {
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

console.log('ParkEasy App JavaScript loaded successfully!');
