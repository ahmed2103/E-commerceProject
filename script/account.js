window.addEventListener("load", async function () {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Check if user is logged in
        // Initialize page
        document.getElementById("sidebar-username").textContent = user.name;
        document.getElementById("sidebar-email").textContent = user.email;
        const avatarImg = document.getElementById("user-avatar");
        avatarImg.src = 'user.jpg';
        document.getElementById("profile-name").textContent = user.name;
        document.getElementById("profile-email").textContent = user.email;
        document.getElementById("profile-phone").textContent = user.phone;
        document.getElementById("profile-gender").textContent = user.gender;

        document.getElementById("edit-name").value = user.name;
        document.getElementById("edit-email").value = user.email;
        document.getElementById("edit-phone").value = user.phone;
        if (user.gender) {
            document.getElementById("edit-gender").value = user.gender;
        }

        // Attach event listeners
        document.getElementById("edit-profile-btn").addEventListener("click", () => {
            document.getElementById("profile-info-display").style.display = "none";
            document.getElementById("edit-profile-form").style.display = "block";
        });

        document.getElementById("cancel-edit-btn").addEventListener("click", () => {
            document.getElementById("edit-profile-form").style.display = "none";
            document.getElementById("profile-info-display").style.display = "block";
        });

        document.getElementById("edit-profile-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            user.name = document.getElementById("edit-name").value;
            user.phone = document.getElementById("edit-phone").value;
            user.gender = document.getElementById("edit-gender").value;

            try {
                const response = await fetch(`http://localhost:3000/users/${user.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(user),
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }

                localStorage.setItem("user", JSON.stringify(user));
                document.getElementById("sidebar-username").textContent = user.name;

                document.getElementById("profile-name").textContent = user.name;
                document.getElementById("profile-email").textContent = user.email;
                document.getElementById("profile-phone").textContent = user.phone;
                document.getElementById("profile-gender").textContent = user.gender;

                document.getElementById("edit-profile-form").style.display = "none";
                document.getElementById("profile-info-display").style.display = "block";
            } catch (error) {
                console.error("Error updating profile:", error);
            }
        });

        // Cache for orders data to avoid redundant fetches
        let ordersCache = null;

        // Fetch orders for current user
        const fetchUserOrders = async () => {
            if (ordersCache) return ordersCache;

            try {
                const res = await fetch(`http://localhost:3000/orders?customerId=${user.id}`);
                if (!res.ok) throw new Error('Failed to fetch orders');
                ordersCache = await res.json();
                return ordersCache;
            } catch (error) {
                console.error("Error fetching user orders:", error);
                throw error;
            }
        };

        // Function to display orders in the UI
        const displayOrders = async () => {
            try {
                const orders = await fetchUserOrders();

                // Get products for order details
                const productsRes = await fetch("http://localhost:3000/products");
                if (!productsRes.ok) throw new Error('Failed to fetch products');
                const products = await productsRes.json();

                const ordersContainer = document.getElementById("orders-container");
                const noOrdersMessage = document.getElementById("no-orders-message");
                const orderTemplate = document.getElementById("order-template");

                // Clear existing orders (except the template)
                Array.from(ordersContainer.children).forEach(child => {
                    if (child !== orderTemplate) ordersContainer.removeChild(child);
                });

                // Check if there are any orders
                if (orders.length === 0) {
                    noOrdersMessage.style.display = "block";
                    return;
                }

                noOrdersMessage.style.display = "none";

                // Group orders by orderId
                const groupedOrders = orders.reduce((acc, order) => {
                    if (!acc[order.orderId]) {
                        acc[order.orderId] = {
                            id: order.orderId,
                            customerId: order.customerId,
                            date: order.date,
                            status: order.status,
                            items: []
                        };
                    }

                    const product = products.find(p => p.id === order.productId);
                    if (product) {
                        acc[order.orderId].items.push({
                            ...product,
                            quantity: order.quantity
                        });
                    }

                    return acc;
                }, {});

                // Display each order
                Object.values(groupedOrders).forEach(order => {
                    const orderElement = orderTemplate.cloneNode(true);
                    orderElement.id = `order-${order.id}`;
                    orderElement.style.display = "block";

                    // Set order details
                    orderElement.querySelector(".order-id").textContent = order.id;
                    orderElement.querySelector(".order-date").textContent = new Date(order.date).toLocaleDateString();

                    // Set status with proper capitalization
                    const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Unknown";
                    const statusElement = orderElement.querySelector(".order-status");
                    statusElement.textContent = statusText;

                    // Set status class for styling
                    const statusContainer = orderElement.querySelector(".account-order-status");
                    const statusClass = order.status ? order.status.toLowerCase() : "unknown";
                    statusContainer.className = `account-order-status status-${statusClass}`;

                    // Display order items
                    const itemsContainer = orderElement.querySelector(".account-order-items");
                    let totalPrice = 0;

                    order.items.forEach(async(item) => {
                        // Ensure price is a number
                        const itemPrice = Number(item.price || 0) * Number(item.quantity || 1);
                        totalPrice += itemPrice;

                        const itemElement = document.createElement("div");
                        itemElement.className = "account-order-item";
                        itemElement.innerHTML = `
                            <div class="account-order-item-img">
                                <img src="${item.imageData || "https://via.placeholder.com/60"}" alt="${item.name}" />
                            </div>
                            <div class="account-order-item-info">
                                <div class="account-order-item-title">${item.name || "Unknown Product"}</div>
                                <div class="account-order-item-price">
                                    <span>Qty: ${item.quantity || 1}</span>
                                    <span>${typeof item.price === 'number' ? item.price.toFixed(2) : item.price || '0.00'}</span>
                                </div>
                            </div>`;
                        itemsContainer.appendChild(itemElement);
                    });

                    // Set total price
                    orderElement.querySelector(".order-total").textContent = `${totalPrice.toFixed(2)}`;

                    // Add the order to the container
                    ordersContainer.appendChild(orderElement);
                });
            } catch (error) {
                console.error("Error displaying orders:", error);
                const noOrdersMessage = document.getElementById("no-orders-message");
                noOrdersMessage.textContent = "Failed to load orders. Please try again later.";
                noOrdersMessage.style.display = "block";
            }
        };

        // Navigation function
        const navigateToSection = async (sectionHash) => {
            document.getElementById("profile-section").style.display = "none";
            document.getElementById("dashboard-section").style.display = "none";
            document.getElementById("orders-section").style.display = "none";
            document.querySelectorAll(".account-nav a").forEach((link) => link.classList.remove("active"));

            if (sectionHash === "#dashboard") {
                document.getElementById("dashboard-section").style.display = "block";
                document.getElementById("dashboard-link").classList.add("active");

                try {
                    const orders = await fetchUserOrders();
                    document.getElementById("total-orders").textContent = orders.length;
                    document.getElementById("pending-orders").textContent = orders.filter(o => o.status === "pending").length;
                    document.getElementById("shipped-orders").textContent = orders.filter(o => o.status === "shipped").length;
                    document.getElementById("completed-orders").textContent = orders.filter(o => o.status === "delivered").length;
                } catch (error) {
                    console.error("Error loading dashboard:", error);
                }
            } else if (sectionHash === "#orders") {
                document.getElementById("orders-section").style.display = "block";
                document.getElementById("orders-link").classList.add("active");
                await displayOrders();
            } else {
                document.getElementById("profile-section").style.display = "block";
                document.getElementById("profile-link").classList.add("active");
            }

            if (window.location.hash !== sectionHash) window.location.hash = sectionHash;
        };

        // Add event listeners to navigation links
        document.getElementById("profile-link").addEventListener("click", (e) => {
            e.preventDefault();
            navigateToSection("#profile");
        });

        document.getElementById("dashboard-link").addEventListener("click", (e) => {
            e.preventDefault();
            if (user.role === "admin") {
                window.location.href = './admin_dashboard.html';
            } else if (user.role === "seller") {
                window.location.href = './seller_dashboard.html';
            } else {
                navigateToSection("#dashboard");
            }
        });

        document.getElementById("orders-link").addEventListener("click", (e) => {
            e.preventDefault();
            navigateToSection("#orders");
        });

        document.querySelector("#logout-link").addEventListener("click", (e) => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });

        // Listen for hash changes to navigate between sections
        window.addEventListener("hashchange", () => {
            navigateToSection(window.location.hash || "#profile");
        });

        // Initialize the page based on the current hash
        await navigateToSection(window.location.hash || "#profile");
    } catch (error) {
        console.error("Error initializing account page:", error);
    }
});