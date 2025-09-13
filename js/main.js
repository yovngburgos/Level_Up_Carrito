// ========================
// Variables globales
// ========================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const formatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

// ========================
// Guardar en localStorage
// ========================
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ========================
// Actualizar ícono contador en navbar
// ========================
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const totalItems = carrito.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// ========================
// Renderizar carrito en el modal
// ========================
function updateCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = "<p>No hay productos en el carrito.</p>";
    updateCartCount();
    return;
  }

  const fragment = document.createDocumentFragment();

  carrito.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("cart-item", "d-flex", "align-items-center", "mb-3");

    itemElement.innerHTML = `
      <div class="quantity-control d-flex flex-column text-center me-3">
        <button class="btn btn-sm btn-link text-decoration-none text-white increase-qty" data-index="${index}">
            <i class="bi bi-caret-up-fill"></i>
        </button>
        <div class="fw-bold">${item.quantity}</div>
        <button class="btn btn-sm btn-link text-decoration-none text-white decrease-qty" data-index="${index}">
            <i class="bi bi-caret-down-fill"></i>
        </button>
      </div>

      <img src="${item.image}" alt="${item.name}" class="cart-item-img me-3">

      <div class="flex-grow-1">
        <h6 class="fw-bold mb-1">${item.name}</h6>
        <p class="text-muted small mb-1"><small class="sku">SKU: ${item.sku}</small></p>
        <span class="product-color-pill me-2">${item.color}</span>
      </div>

      <div class="d-flex flex-column align-items-end ms-auto">
        <span class="fw-bold text-primary mb-2">${formatter.format(item.price * item.quantity)}</span>
        <button class="btn btn-sm btn-danger remove-item" data-index="${index}">
            <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    `;
    fragment.appendChild(itemElement);
  });

  const total = carrito.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalElement = document.createElement("div");
  totalElement.classList.add("d-flex", "justify-content-between", "align-items-center", "mt-3", "pt-2", "border-top");
  totalElement.innerHTML = `
    <h5>Total:</h5>
    <h5 class="text-success">${formatter.format(total)}</h5>
  `;
  fragment.appendChild(totalElement);

  cartItemsContainer.appendChild(fragment);
  updateCartCount();
}

// ========================
// Lógica de autenticación
// ========================
function updateAuthButtons() {
  const authButtons = document.getElementById("auth-buttons");
  const accountButton = document.getElementById("account-button");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (authButtons && accountButton) {
    if (isLoggedIn === "true" && userData) {
      authButtons.classList.add("d-none");
      accountButton.classList.remove("d-none");
      accountButton.textContent = `Hola, ${userData.nombre.split(" ")[0]}`;
    } else {
      authButtons.classList.remove("d-none");
      accountButton.classList.add("d-none");
    }
  }
}

// ========================
// Página de perfil
// ========================
function handleProfilePage() {
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profileTel = document.getElementById("profile-tel");
  const logoutButton = document.getElementById("logout-button");
  const editProfileButton = document.getElementById("edit-profile-btn");
  const editFormContainer = document.getElementById("edit-profile-form-container");
  const editForm = document.getElementById("edit-form");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (profileName && profileEmail && userData) {
    profileName.textContent = userData.nombre;
    profileEmail.textContent = userData.email;
    if (profileTel) {
      profileTel.textContent = userData.tel || "No disponible";
    }
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userData");
      localStorage.removeItem("redirectToCheckout");
      window.location.href = "index.html";
    });
  }

  if (editProfileButton && editFormContainer && editForm && cancelEditBtn) {
    editProfileButton.addEventListener("click", () => {
      document.getElementById("profile-view").classList.add("d-none");
      editFormContainer.classList.remove("d-none");

      document.getElementById("edit-nombre").value = userData.nombre;
      document.getElementById("edit-email").value = userData.email;
      document.getElementById("edit-tel").value = userData.tel;
    });

    cancelEditBtn.addEventListener("click", () => {
      editFormContainer.classList.add("d-none");
      document.getElementById("profile-view").classList.remove("d-none");
    });

    editForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (editForm.checkValidity()) {
        const nuevoNombre = document.getElementById("edit-nombre").value;
        const nuevoEmail = document.getElementById("edit-email").value;
        const nuevoTel = document.getElementById("edit-tel").value;

        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

        // Guardar email original antes de cambios
        const originalEmail = userData.email;
        const userExists = registeredUsers.find(
          (u) => u.email === nuevoEmail && u.email !== originalEmail
        );

        if (userExists) {
          alert("El nuevo correo ya está registrado por otro usuario.");
          return;
        }

        // Actualizar datos
        userData.nombre = nuevoNombre;
        userData.email = nuevoEmail;
        userData.tel = nuevoTel;
        localStorage.setItem("userData", JSON.stringify(userData));

        const userIndex = registeredUsers.findIndex((u) => u.email === originalEmail);
        if (userIndex !== -1) {
          registeredUsers[userIndex].nombre = nuevoNombre;
          registeredUsers[userIndex].email = nuevoEmail;
          registeredUsers[userIndex].tel = nuevoTel;
          localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
        }

        alert("¡Datos actualizados con éxito!");
        editFormContainer.classList.add("d-none");
        document.getElementById("profile-view").classList.remove("d-none");
        handleProfilePage();
      }
    });
  }
}

// ========================
// Checkout - Autocompletar datos
// ========================
function autofillCheckoutForm() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const checkoutNameField = document.getElementById("checkout-nombre");
  const checkoutEmailField = document.getElementById("checkout-email");
  const checkoutTelField = document.getElementById("checkout-tel");

  if (userData && checkoutNameField && checkoutEmailField) {
    checkoutNameField.value = userData.nombre || "";
    checkoutEmailField.value = userData.email || "";
    if (checkoutTelField) {
      checkoutTelField.value = userData.tel || "";
    }
  }
}

// ========================
// Resumen de pedido
// ========================
function handleOrderSummaryPage() {
  const orderDetailsContainer = document.getElementById("order-details");
  const orderTotalElement = document.getElementById("order-total");

  if (!orderDetailsContainer || !orderTotalElement) return;

  const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));

  if (!lastOrder) {
    orderDetailsContainer.innerHTML = "<p>No se encontró un resumen de pedido.</p>";
    orderTotalElement.textContent = "$0";
    return;
  }

  const { items, total, shippingInfo } = lastOrder;

  let itemsHtml = `<h6>Productos:</h6><ul class="list-group mb-3">`;
  items.forEach((item) => {
    itemsHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${item.name} x${item.quantity}</span>
        <span class="fw-bold">${formatter.format(item.price * item.quantity)}</span>
      </li>
    `;
  });
  itemsHtml += `</ul>`;

  const shippingHtml = `
    <h6>Información de Envío:</h6>
    <p><strong>Nombre:</strong> ${shippingInfo.nombre}</p>
    <p><strong>Correo:</strong> ${shippingInfo.email}</p>
    <p><strong>Teléfono:</strong> ${shippingInfo.tel}</p>
    <p><strong>Dirección:</strong> ${shippingInfo.direccion}</p>
    <p><strong>Método de Pago:</strong> ${shippingInfo.metodo}</p>
  `;

  orderDetailsContainer.innerHTML = itemsHtml + shippingHtml;
  orderTotalElement.textContent = formatter.format(total);
}

// ========================
// Eventos principales
// ========================
document.addEventListener("DOMContentLoaded", () => {
  updateCart();
  updateAuthButtons();
  handleProfilePage();
  autofillCheckoutForm();
  handleOrderSummaryPage();

  // Eventos del carrito
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-item") || target.closest(".remove-item")) {
        const index = target.closest(".remove-item").dataset.index;
        carrito.splice(index, 1);
        guardarCarrito();
        updateCart();
      } else if (target.classList.contains("decrease-qty") || target.closest(".decrease-qty")) {
        const index = target.closest(".decrease-qty").dataset.index;
        if (carrito[index].quantity > 1) {
          carrito[index].quantity--;
        } else {
          carrito.splice(index, 1);
        }
        guardarCarrito();
        updateCart();
      } else if (target.classList.contains("increase-qty") || target.closest(".increase-qty")) {
        const index = target.closest(".increase-qty").dataset.index;
        carrito[index].quantity++;
        guardarCarrito();
        updateCart();
      }
    });
  }

  // Añadir producto al carrito
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const name = e.target.dataset.name;
      const price = parseInt(e.target.dataset.price);
      const sku = e.target.dataset.sku || "N/A";
      const color = e.target.dataset.color || "N/A";
      const image = e.target.dataset.image || "https://via.placeholder.com/150";

      const itemInCart = carrito.find((item) => item.name === name);
      if (itemInCart) {
        itemInCart.quantity++;
      } else {
        carrito.push({ name, price, sku, color, image, quantity: 1 });
      }

      guardarCarrito();
      updateCart();
    });
  });

  // Vaciar carrito
  const clearCartBtn = document.getElementById("clear-cart");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      carrito = [];
      guardarCarrito();
      updateCart();
    });
  }

  // Checkout con login obligatorio
  const checkoutLink = document.getElementById("checkout-link");
  if (checkoutLink) {
    checkoutLink.addEventListener("click", (e) => {
      if (carrito.length === 0) {
        e.preventDefault();
        alert("Tu carrito está vacío. Añade productos antes de finalizar la compra.");
        return;
      }

      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        e.preventDefault();
        localStorage.setItem("redirectToCheckout", "true");
        window.location.href = "login.html";
      } else {
        window.location.href = "checkout.html";
      }
    });
  }

  // Validaciones de formularios
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // Login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const user = registeredUsers.find((u) => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem(
          "userData",
          JSON.stringify({ nombre: user.nombre, email: user.email, tel: user.tel })
        );
        const redirectToCheckout = localStorage.getItem("redirectToCheckout") === "true";
        if (redirectToCheckout) {
          localStorage.removeItem("redirectToCheckout");
          window.location.href = "checkout.html";
        } else {
          window.location.href = "index.html";
        }
      } else {
        alert("Usuario o contraseña incorrectos.");
      }
    });
  }

  // Registro
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("email").value;
      const tel = document.getElementById("tel").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password !== confirmPassword) {
        document.getElementById("confirm-password").setCustomValidity("Las contraseñas no coinciden.");
        registerForm.classList.add("was-validated");
        return;
      } else {
        document.getElementById("confirm-password").setCustomValidity("");
      }

      if (registerForm.checkValidity()) {
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        const userExists = registeredUsers.find((u) => u.email === email);

        if (userExists) {
          alert("El correo ya está registrado.");
        } else {
          registeredUsers.push({ nombre, email, tel, password });
          localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

          alert("Registro exitoso. Ahora puedes iniciar sesión.");
          window.location.href = "login.html";
        }
      }
    });
  }

  // Checkout - Guardar pedido
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (checkoutForm.checkValidity()) {
        const nombre = document.getElementById("checkout-nombre").value;
        const email = document.getElementById("checkout-email").value;
        const tel = document.getElementById("checkout-tel").value;
        const direccion = document.getElementById("checkout-direccion").value;
        const metodo = document.getElementById("checkout-metodo").value;

        const currentOrder = {
          items: carrito,
          total: carrito.reduce((acc, item) => acc + item.price * item.quantity, 0),
          shippingInfo: { nombre, email, tel, direccion, metodo },
          date: new Date().toISOString(),
        };

        localStorage.setItem("lastOrder", JSON.stringify(currentOrder));
        carrito = [];
        guardarCarrito();
        window.location.href = "order-summary.html";
      }
    });
  }

  // Formulario de contacto
  const contactForm = document.getElementById("contact-form");
  const successModalEl = document.getElementById("successModal");
  if (contactForm && successModalEl) {
    const successModal = new bootstrap.Modal(successModalEl);
    contactForm.addEventListener("submit", (e) => {
      if (contactForm.checkValidity()) {
        e.preventDefault();
        successModal.show();
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      }
    });
  }
});