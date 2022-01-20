// data
let productList = [];
let cartList = [];
// DOM
const productDom = document.querySelector(".productWrap");
const cartItemDom = document.querySelector(".js-cartItem");
const finalTotalDom = document.querySelector("#finalTotal");
const deleteAllCartDom = document.querySelector(".discardAllBtn");
const myCartDom = document.querySelector(".shoppingCart");
const productSelect = document.querySelector(".productSelect");
const sendOrderBtn = document.querySelector(".orderInfo-btn");
const forms = document.querySelectorAll(".form-control,.form-select");
// <------ 監聽 ------>
// 刪除全部產品
deleteAllCartDom.addEventListener("click", deleteCartAllItem, false);
// 加入購物車
productDom.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.getAttribute("data-id") == null) {
    return;
  }
  let num = 1;
  let id = e.target.getAttribute("data-id");
  cartList.forEach((item) => {
    if (item.product.id === id) {
      num = item.quantity += 1;
    }
  });
  axios
    .post(`${baseUrl}customer/${path}/carts`, {
      data: {
        productId: id,
        quantity: num,
      },
    })
    .then((res) => {
      cartList = res.data.carts;
      getCartList();
    });
});
// 篩選產品
productSelect.addEventListener("change", function () {
  let category = productSelect.value;
  if (category === "全部") {
    renderProduct(productList);
    return;
  }
  let cacheData = productList.filter((item) => {
    return category === item.category;
  });
  renderProduct(cacheData);
});
// 送出訂單
sendOrderBtn.addEventListener(
  "click",
  function (e) {
    e.preventDefault();
    if (cartList.length == 0) {
      alert("購物車不得為空");
      location.hash = "#transport";
      location.href = location.href;
      validateForm();
      return false;
    }
    let validate = true;
    forms.forEach(function (form) {
      if (!form.value.trim()) {
        form.parentNode.classList.add("was-validated");
        validate = false;
      }
    });
    if (validate) {
      sendOrder();
    }
  },
  false
);

// <------ 監聽 結束------>
// 初始化
init();
function init() {
  getProductList();
  getCartList();
}
//驗證表單
function validateForm() {
  forms.forEach((item) => {
    item.parentNode.classList.remove("was-validated");
    item.addEventListener("blur", function (e) {
      item.parentNode.classList.add("was-validated");
    });
  });
}
validateForm();
// 取得產品列表
function getProductList() {
  axios
    .get(
      `${baseUrl}customer/${path}/products
  `
    )
    .then((res) => {
      productList = res.data.products;
      renderProduct(productList);
    });
}
// 取得購物車列表
function getCartList() {
  axios.get(`${baseUrl}customer/${path}/carts`).then(function (response) {
    cartList = response.data.carts;
    if (cartList.length === 0) {
      myCartDom.setAttribute("style", "display:none");
    } else {
      myCartDom.removeAttribute("style");
    }
    renderCart();
    let formatTotal = formatNumber(response.data.finalTotal);
    finalTotalDom.textContent = `NT$${formatTotal}`;
  });
}
// 編輯購物車數量
function editCartItem(id, num) {
  axios
    .patch(`${baseUrl}customer/${path}/carts`, {
      data: {
        id: id,
        quantity: Number(num),
      },
    })
    .then(() => {
      getCartList();
    });
}
// 刪除購物車全部產品
function deleteCartAllItem(e) {
  e.preventDefault();
  axios
    .delete(`${baseUrl}customer/${path}/carts`)
    .then((res) => {
      cartList = res.data.carts;
      getCartList();
    })
    .catch((err) => {
      console.log(err);
    });
}
// 刪除購物車內特定產品
function deleteCartItem(e) {
  e.preventDefault();
  cartId = e.target.dataset.id;
  axios
    .delete(`${baseUrl}customer/${path}/carts/${cartId}`)
    .then(function (response) {
      getCartList();
    });
}
myCartDom.addEventListener("click", function (e) {
  if (e.target.dataset.edit !== "remove") {
    return;
  }
  deleteCartItem(e);
});
// 新增產品訂單
function addOrder() {}
// 渲染產品
function renderProduct(product) {
  let str = "";
  product.forEach((item) => {
    str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${formatNumber(item.origin_price)}</del>
    <p class="nowPrice">NT$${formatNumber(item.price)}</p>
  </li>`;
  });
  productDom.innerHTML = str;
}
// 渲染購物車
function renderCart() {
  let str = "";
  cartList.forEach((item) => {
    str += `<tr>
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="">
        <p>${formatNumber(item.product.title)}</p>
      </div>
    </td>
    <td>NT$${formatNumber(item.product.price)}</td>
    <td class="js-quantity">  ${
      item.quantity == 1
        ? `<span class="material-icons removeItem" data-edit="remove" data-id="${item.id}">
        delete
        </span>`
        : `<span class="material-icons" data-edit="minus" data-num="${
            item.quantity - 1
          }" data-id="${item.id}">
          remove
          </span>`
    } ${item.quantity}<span class="material-icons" data-edit="add" data-num="${
      item.quantity + 1
    }" data-id="${item.id}">
    add
    </span></td>
    <td>NT$${formatNumber(item.product.price * item.quantity)}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" data-id="${item.id}">
        clear
      </a>
    </td>
  </tr>`;
  });

  cartItemDom.innerHTML = str;

  const deleteBtn = document.querySelectorAll(".discardBtn a");
  const editBtn = document.querySelectorAll(".js-quantity [data-num]");

  editBtn.forEach((btn) => {
    btn.addEventListener(
      "click",
      function (e) {
        editCartItem(btn.dataset.id, btn.dataset.num);
      },
      false
    );
  });
  deleteBtn.forEach((link) => {
    link.addEventListener("click", deleteCartItem, false);
  });
}
// 送出訂單
function sendOrder() {
  const userName = document.querySelector("#customerName").value;
  const userPhone = document.querySelector("#customerPhone").value;
  const userEmail = document.querySelector("#customerEmail").value;
  const userAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  axios
    .post(`${baseUrl}customer/${path}/orders`, {
      "data": {
        "user": {
          "name": userName,
          "tel": userPhone,
          "email": userEmail,
          "address": userAddress,
          "payment": tradeWay,
        },
      },
    })
    .then((res) => {
      if (res.data.status) {
        alert("訂單交易成功");
        forms.forEach((item) => {
          item.value = "";
          item.parentNode.classList.remove("was-validated");
        });
        getCartList();
        location.href = `${location.origin}${location.pathname}`;
      }
    });
}
// util 外部函式
// 格式化數字
function formatNumber(num) {
  let formatNum = num
    .toString()
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  return formatNum;
}
