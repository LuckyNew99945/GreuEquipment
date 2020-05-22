//DOM
const cartBtn = document.querySelector(".cart-icon");
const cartSection = document.querySelector(".your-cart");
const closeBtn = document.getElementById("close-btn");
const clearBtn = document.getElementById("clear-cart");
const cartTotal = document.querySelector(".cart-total");
const cartRow = document.querySelector(".cart-row");
const productsDOM = document.querySelector(".product-row");

let cart = [];

let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.products;
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  initApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeBtn.addEventListener("click", this.hideCart);
  }

  hideCart() {
    cartBtn.classList.remove("translate");
    cartSection.classList.remove("translate-cart");
  }

  showCart() {
    cartBtn.classList.add("translate");
    cartSection.classList.add("translate-cart");
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  displayProducts(products) {
    let result = "";
    // console.log(products);
    products.forEach((product) => {
      result += `
      <section class="product">
      <section class="product-img">
        <img src=${product.image} alt="product" />
        <button class="cart-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>
          add to cart
        </button>
      </section>
      <p>${product.title}</p>
      <span>$ ${product.price}</span>
    </section>
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const btns = [...document.querySelectorAll(".cart-btn")];
    buttonsDOM = btns;
    // console.log(btns);
    btns.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // console.log(cartItem);

        cart = [...cart, cartItem];
        // console.log(cart);

        Storage.saveCart(cart);

        this.setCartValues(cart);

        this.addCartItem(cartItem);
      });
    });
  }

  cartLogic() {
    clearBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartRow.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-angle-right")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        // console.log(id);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-angle-left")) {
        let minAmount = event.target;
        let id = minAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          minAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          cartRow.removeChild(
            minAmount.parentElement.parentElement.parentElement
          );
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartRow.children.length > 0) {
      cartRow.removeChild(cartRow.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `  <i class="fas fa-shopping-cart"></i>
    add to cart
    `;
  }

  setCartValues(cart) {
    let tempTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
    });
    cartTotal.innerText = tempTotal;
  }

  addCartItem(item) {
    const section = document.createElement("section");
    section.classList.add("product-items");
    // console.log(item);
    section.innerHTML = `
    <section class="product-items-img">
    <img src=${item.image} alt="" />
  </section>
  <section class="product-items-text">
    <h3>${item.title}</h3>
    <span>$ ${item.price}</span>
    <section class="product-items-quantity">
      <i class="fas fa-angle-left" data-id=${item.id}></i>
      <span>${item.amount}</span>
      <i class="fas fa-angle-right" data-id=${item.id}></i>
    </section>
  </section>
    `;
    cartRow.appendChild(section);
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(test) {
    localStorage.setItem("products", JSON.stringify(test));
    // console.log(test);
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //initialize
  ui.initApp();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
