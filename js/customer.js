// apiUrl
const path = "youting";
const token = "cDkhvBxH8ibMGh4ZE8D2H5DMGKt2";
const baseUrl = "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/";
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
// <------ 監聽 ------>
// 刪除全部產品
deleteAllCartDom.addEventListener("click", deleteCartAllItem, false);
// 加入購物車
productDom.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.getAttribute("data-id") == null) {
    return;
  }
  let id = e.target.getAttribute("data-id");
  axios
    .post(`${baseUrl}${path}/carts`, {
      data: {
        productId: id,
        quantity: 1,
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
// <------ 監聽 結束------>
// 初始化
init();
function init() {
  getProductList();
  getCartList();
}
// 取得產品列表
function getProductList() {
  axios
    .get(
      `${baseUrl}${path}/products
  `
    )
    .then((res) => {
      productList = res.data.products;
      renderProduct(productList);
    });
}
// 取得購物車列表
function getCartList() {
  axios
    .get(
      `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${path}/carts`
    )
    .then(function (response) {
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
// 刪除購物車全部產品
function deleteCartAllItem(e) {
  e.preventDefault();
  axios
    .delete(
      "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/youting/carts"
    )
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
    .delete(
      `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${path}/carts/${cartId}`
    )
    .then(function (response) {
      getCartList();
    });
}
// 新增產品訂單
function addOrder() {
  axios
    .post(
      "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/youting/orders",
      {
        "data": {
          "user": {
            "name": "六角學院",
            "tel": "07-5313506",
            "email": "hexschool@hexschool.com",
            "address": "高雄市六角學院路",
            "payment": "Apple Pay",
          },
        },
      }
    )
    .then((res) => {
      console.log(res.data);
    });
}
// 取得訂單列表
function getOrder() {
  axios
    .get(
      "https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/youting/orders",
      {
        headers: {
          "authorization": token,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
    });
}
// 刪除訂單
function deleteOrderItem(orderID = "") {
  axios
    .delete(
      `https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/youting/orders/${orderID}`,
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
    });
}
// 渲染產品
function renderProduct(prodcut) {
  let str = "";
  prodcut.forEach((item) => {
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
    <td>${item.quantity}</td>
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
  deleteBtn.forEach((link) => {
    link.addEventListener("click", deleteCartItem, false);
  });
}
// 格式化數字
function formatNumber(num) {
  let formatNum = num
    .toString()
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  return formatNum;
}
// deleteItem
// function deleteCartItem(e) {
//   let cartId = e.target.dataset.id;
//   console.log(cartId);
//   deleteCartItem(cartId);
// }