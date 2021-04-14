// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector(".menuToggle");
let linkBtn = document.querySelectorAll(".topBar-menu a");
let menu = document.querySelector(".topBar-menu");
menuOpenBtn.addEventListener("click", menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener("click", closeMenu);
});

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
// C3.js
let chart = c3.generate({
  bindto: "#chart", // HTML 元素綁定
  data: {
    type: "pie",
    columns: [
      ["Louvre 雙人床架", 1],
      ["Antony 雙人床架", 2],
      ["Anty 雙人床架", 3],
      ["其他", 4],
    ],
    colors: {
      "Louvre 雙人床架": "#DACBFF",
      "Antony 雙人床架": "#9D7FEA",
      "Anty 雙人床架": "#5434A7",
      "其他": "#301E5F",
    },
  },
});
// DOM
const orderTable = document.querySelector(".js-orderTable");
const allOrderTable = document.querySelector(".orderPage-table");
const deleteAllOrders = document.querySelector(".discardAllBtn");
// 初始化
console.log(baseUrl, path, token);
function init() {
  getOrderList();
}
init();
// ------ 監聽
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
    });
}
// 渲染訂單
function renderOrderList() {
  let str = "";
  orderList.forEach((item) => {
    // 處理產品字串
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
        <p>Louvre 雙人床架</p>
      </td>
      <td>${dateStr}</td>
      <td class="orderStatus">
        <a href="#" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
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
// 處理訂單字串
function formatDateStr(timestamp) {
  // 處理日期字串
  let orderDate = new Date(timestamp * 1000);
  let year = orderDate.getFullYear();
  let month = orderDate.getMonth() + 1;
  let date = orderDate.getDate();
  return `${year}/${month}/${date}`;
}
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
