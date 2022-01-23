// DOM
const orderTable = document.querySelector(".js-orderTable");
const allOrderTable = document.querySelector(".orderPage-table");
const deleteAllOrders = document.querySelector(".discardAllBtn");
const menuOpenBtn = document.querySelector(".menuToggle");
const linkBtn = document.querySelectorAll(".topBar-menu a");
const menu = document.querySelector(".topBar-menu");

function menuToggle() {
  if (menu.classList.contains("openMenu")) {
    menu.classList.remove("openMenu");
  } else {
    menu.classList.add("openMenu");
  }
}
function closeMenu() {
  menu.classList.remove("openMenu");
}
// 初始化
function init() {
  getOrderList();
}
init();
// ------ 監聽
menuOpenBtn.addEventListener("click", menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener("click", closeMenu);
});
allOrderTable.addEventListener("click", function (e) {
  e.preventDefault();
  // 判斷點擊刪除按鈕
  if (e.target.getAttribute("class") === "delSingleOrder-Btn") {
    // 刪除指定單筆訂單
    let id = e.target.dataset.id;
    deleteOrder(id);
    return;
  }
  // 判斷點擊狀態按鈕
  if (!e.target.dataset.status) {
    return;
  } else {
    // 修改訂單
    let dataStr = e.target.dataset.status;
    let id = e.target.dataset.id;
    if (dataStr === "false") {
      dataStr = false;
    } else if (dataStr === "true") {
      dataStr = true;
    }
    changeOrderStatus(dataStr, id);
  }
});
deleteAllOrders.addEventListener("click", function (e) {
  e.preventDefault();
  deleteOrder();
});
// ------ 監聽結束
// 定義資料
let orderList = [];
// 取得訂單
function getOrderList() {
  axios
    .get(`${baseUrl}admin/${path}/orders`, {
      headers: {
        authorization: token,
      },
    })
    .then((res) => {
      orderList = res.data.orders;
      renderOrderList();
      processC3Data();
    });
}
// 渲染訂單
function renderOrderList() {
  let str = "";
  orderList.forEach((item) => {
    // 處理產品字串
    let productStr = formatProductStr(item.products);
    // 處理日期字串
    let dateStr = formatDateStr(item.createdAt);
    // 處理訂單狀態字串
    let orderStatus = formatStatusStr(item.paid);
    // 表格字串
    str += `<tr>
      <td>${item.id}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        ${productStr}
      </td>
      <td>${dateStr}</td>
      <td class="${orderStatus == "已處理" ? "orderStatus" : "orderStatus no"}">
        <a href="#" data-status="${item.paid}" data-id="${
      item.id
    }">${orderStatus}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" data-id="${
          item.id
        }" value="刪除">
      </td>
    </tr>`;
  });
  orderTable.innerHTML = str;
}
// 修改訂單
function changeOrderStatus(status, id) {
  axios
    .put(
      `${baseUrl}admin/${path}/orders`,
      {
        data: {
          id: id,
          paid: !status,
        },
      },
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then((res) => {
      getOrderList();
    });
}
// 刪除指定訂單
function deleteOrder(id = "") {
  axios
    .delete(`${baseUrl}admin/${path}/orders/${id}`, {
      headers: {
        authorization: token,
      },
    })
    .then((res) => {
      getOrderList();
    });
}
// 處理訂單日期字串
function formatDateStr(timestamp) {
  // 處理日期字串
  let orderDate = new Date(timestamp * 1000);
  let year = orderDate.getFullYear();
  let month = orderDate.getMonth() + 1;
  let date = orderDate.getDate();
  return `${year}/${month}/${date}`;
}
// 處理訂單狀態字串
function formatStatusStr(status) {
  // 假如未處理
  if (!status) {
    status = !status;
    return `未處理`;
  } else {
    status = !status;
    return `已處理`;
  }
}
// 處理訂單產品字串
function formatProductStr(products) {
  let productStr = "";
  products.forEach((item) => {
    productStr += `<p>${item.title} * ${item.quantity}</p>`;
  });
  return productStr;
}
// 處理 C3 資料
function processC3Data() {
  let obj = {};
  orderList.forEach((item) => {
    item.products.forEach((product) => {
      if (obj[product.title] === undefined) {
        obj[product.title] = product.price * product.quantity;
      } else {
        obj[product.title] += product.price * product.quantity;
      }
    });
  });
  let productKeyArr = Object.keys(obj);
  const c3Arr = [];
  productKeyArr.forEach((item) => {
    let arr = [];
    arr.push(item);
    arr.push(obj[item]);
    c3Arr.push(arr);
  });
  c3Arr.sort((a, b) => {
    return b[1] - a[1];
  });
  let top3 = sortTop3(c3Arr);
  renderC3(top3);
}
// 排序 C3 資料
function sortTop3(arr) {
  if (arr.length > 3) {
    let top3 = arr.slice(0, 3);
    let other = arr.slice(3, arr.length);
    const otherArr = ["其他"];
    let total = 0;
    other.forEach((item) => {
      total += item[1];
    });
    otherArr.push(total);
    top3.push(otherArr);
    top3.sort((a, b) => {
      return b[1] - a[1];
    });
    return top3;
  } else {
    return arr;
  }
}
// 渲染 C3
function renderC3(data) {
  c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: data,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}
