// This script runs on all pages. We use checks to run page-specific code.
document.addEventListener('DOMContentLoaded', () => {
    // Code to run on the cart page
    if (document.querySelector('.cart-page')) {
        displayCartItems();
    }
    // Code to run on the payment page
    if (document.querySelector('.payment-page')) {
        displayOrderSummary();
        setupPaymentForm();
    }
});

/**
 * Adds a product to the cart or updates its quantity.
 * Cart data is stored in localStorage.
 * @param {object} product - The product object {name, price, image}
 */
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Check if product already exists in cart
    let existingProduct = cart.find(item => item.name === product.name);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.name} added to cart!`);
}

/**
 * Displays the cart items on the cart.html page.
 */
function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById('cart-items-container');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty. <a href="index.html">Start shopping!</a></p>';
        cartSummaryContainer.style.display = 'none';
        return;
    }

    cartContainer.innerHTML = ''; // Clear previous items
    cart.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <p>Quantity: ${item.quantity}</p>
                    <button onclick="removeFromCart('${item.name}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        cartContainer.innerHTML += cartItemHTML;
    });
    
    updateCartSummary(cart);
}

/**
 * Updates the cart summary (total price and checkout button).
 */
function updateCartSummary(cart) {
    const cartSummaryContainer = document.getElementById('cart-summary');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    
    cartSummaryContainer.innerHTML = `
        <h3>Cart Summary</h3>
        <p>Subtotal: <span>$${subtotal.toFixed(2)}</span></p>
        <p>Tax (5%): <span>$${tax.toFixed(2)}</span></p>
        <hr>
        <h4>Total: <span>$${total.toFixed(2)}</span></h4>
        <button class="product-card button" onclick="window.location.href='payment.html'">Proceed to Checkout</button>
    `;
    cartSummaryContainer.style.display = 'block';
}

/**
 * Removes an item from the cart and updates the display.
 * @param {string} productName - The name of the product to remove.
 */
function removeFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.name !== productName);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems(); // Re-render the cart
}

/**
 * Displays the order summary on the payment.html page.
 */
function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const summaryContainer = document.getElementById('order-summary');
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `<p>${item.name} (x${item.quantity}) <span>$${(item.price * item.quantity).toFixed(2)}</span></p>`;
    });

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    summaryContainer.innerHTML = `
        <h3>Order Summary</h3>
        ${itemsHTML}
        <hr>
        <p>Subtotal: <span>$${subtotal.toFixed(2)}</span></p>
        <p>Tax: <span>$${tax.toFixed(2)}</span></p>
        <h4>Total: <span>$${total.toFixed(2)}</span></h4>
    `;
}

/**
 * Sets up the payment form, including the method switcher.
 */
function setupPaymentForm() {
    const form = document.getElementById('main-payment-form');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const submitBtn = document.getElementById('submit-payment-btn');

    // Handle switching between payment methods
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all content sections
            document.querySelectorAll('.payment-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected content section
            const selectedContent = document.getElementById(`${this.value}-payment-content`);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }

            // Update button text and required fields
            if (this.value === 'cod') {
                submitBtn.textContent = 'Place Order';
                // Remove required attribute from card fields for COD
                document.querySelectorAll('#card-payment-content input').forEach(input => input.required = false);
            } else {
                submitBtn.textContent = 'Pay Now';
                // Add required attribute back for card payments
                document.querySelectorAll('#card-payment-content input').forEach(input => input.required = true);
            }
        });
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // For Card payment, check if the card form is valid
        if (selectedMethod === 'card') {
            const cardName = document.getElementById('name').value;
            const cardNumber = document.getElementById('card-number').value;
            if (!cardName || !cardNumber) {
                alert('Please fill out all required card details.');
                return;
            }
        }
        
        // For all methods, proceed to success
        handleSuccessfulPayment(selectedMethod);
    });
}

/**
 * Handles the logic after a successful payment or order placement.
 */
function handleSuccessfulPayment(method) {
    const popup = document.getElementById('order-success-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');

    // Customize popup message based on payment method
    if (method === 'cod') {
        popupTitle.textContent = 'Order Placed Successfully!';
        popupMessage.textContent = 'Your order will be delivered soon. Please pay the courier upon arrival.';
    } else {
        popupTitle.textContent = 'Payment Successful!';
        popupMessage.textContent = 'Thank you for your purchase. Your order is being processed.';
    }
    
    popup.style.display = 'flex';
    
    localStorage.removeItem('cart'); // Clear the cart
    updateCartCounter(); // Update the cart icon in the header

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 4000); // Redirect to homepage after 4 seconds
}
/**
 * Shows a temporary toast notification.
 * @param {string} message - The message to display.
 */
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}
// Add these new functions to the end of your script.js

// --- Form Toggling Functions ---

function showSignUpForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

// --- Account Management Functions ---

/**
 * Handles the user sign-up process.
 */
function handleSignUp(event) {
    event.preventDefault(); // Prevents the form from submitting the traditional way
    
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Get existing users from localStorage or initialize an empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the username is already taken
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert("Username is already taken. Please choose another one.");
        return;
    }

    // Add the new user
    const newUser = { username, email, password };
    users.push(newUser);
    
    // Save the updated users array back to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    alert("Account created successfully! Please log in.");
    showLoginForm(); // Switch back to the login form
}

/**
 * Handles the user login process.
 */
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Find the user with matching credentials
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
        alert(`Welcome back, ${username}!`);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', username); // Store the logged-in user's name
        window.location.href = 'index.html'; // Redirect to the homepage
    } else {
        alert("Invalid username or password.");
    }
}

// --- Update Navigation based on Login Status ---
// This code checks if a user is logged in and updates the nav bar
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loggedInUser = localStorage.getItem('loggedInUser');

    // This part is a bit more advanced but a great next step.
    // Let's modify the nav for now. We will improve this later.
    const navLinks = document.querySelector('header nav');
    if (isLoggedIn && navLinks) {
        // Simple update: change login to logout. More advanced would be to rebuild the nav.
        const loginLink = Array.from(navLinks.getElementsByTagName('a')).find(a => a.textContent.includes('Login'));
        if (loginLink) {
           loginLink.textContent = `Logout (${loggedInUser})`;
           loginLink.href = "#"; // Prevent navigation
           loginLink.onclick = () => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html'; // Refresh
           };
        }
    }
});
// Add this new code to the end of script.js

/**
 * Initializes the Swiper.js carousel for featured treatments.
 */
document.addEventListener('DOMContentLoaded', function () {
    const swiper = new Swiper('.swiper', {
        // How many slides to show at once
        slidesPerView: 1,
        // Space between slides
        spaceBetween: 30,
        // Optional: loop the slides
        loop: true,

        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // Responsive breakpoints
        breakpoints: {
            // when window width is >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            // when window width is >= 768px
            768: {
                slidesPerView: 3,
                spaceBetween: 30
            },
            // when window width is >= 1200px
            1200: {
                slidesPerView: 4,
                spaceBetween: 30
            }
        }
    });
});