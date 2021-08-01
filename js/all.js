const productList = document.querySelector(".productWrap");
const cartList = document.querySelector(".cartTableList");
let productData = [];
let cartData = [];
function init() {
    getProduct();
    getCart();
}
init();
// 取得產品資料
function getProduct() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${myPath}/products`)
    .then(function (response) {
    productData = response.data.products;
      renderProduct();
    })
    .catch(function (error) {
      console.log(error);
    })    
}
// 組字串重複，另外拉出來一個函式
function combineProductHTMLItem(product) {
    return `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${product.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
            <h3>${product.title}</h3>
            <del class="originPrice">NT$${toThousands(product.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(product.price)}</p>
            </li>`
}
// 渲染產品
function renderProduct(products) {
    let str = '';
    productData.forEach(function (product) {
        str += combineProductHTMLItem(product)
    })
    productList.innerHTML = str;    
}
// 篩選產品列表
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener('change',function (e) {
    let productCategory = e.target.value;
    if(productCategory === '全部'){
        renderProduct();
        return;  
    }
    let str = '';
    productData.forEach(function (product) {
        if (productCategory == product.category){
            str += combineProductHTMLItem(product)
        }
    })
    productList.innerHTML = str;    
})

// 取得購物車資料
function getCart() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${myPath}/carts`)
    .then(function (response) {
     cartData = response.data.carts;
     renderCart();  
    })
    .catch(function (error) {
      console.log(error);
    })    
}
// 渲染購物車列表
function renderCart() {
    let str = '';
    let allProductsTotalPrice = 0;
    cartData.forEach(function (cart) {
        let productTotal = Number(cart.product.price)*Number(cart.quantity);
        str += `<tr><td>
                <div class="cardItem-title">
                    <img src="${cart.product.images}" alt="">
                    <p>${cart.product.title}</p>
                </div>
                </td>
                <td>NT$${toThousands(cart.product.price)}</td>
                <td>${cart.quantity}</td>
                <td>NT$${toThousands(productTotal)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-id="${cart.id}">
                        clear
                    </a>
                </td></tr>`
    allProductsTotalPrice += productTotal;    
    })
    if(cartData.length !== 0){
        str += `<tr><td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
                </td>
                <td></td>
                <td></td>
                <td>
                    <p>總金額</p>
                </td>
                <td>NT$${toThousands(allProductsTotalPrice)}</td>
                </tr>`;
    }
    cartList.innerHTML = str;
}
// 加入購物車
function addCartItem(id) {
    let addTimes = 1;
    cartData.forEach(function (item) {
        if(item.product.id === id){
            addTimes = item.quantity += 1;
        }
    })
    let data = {
        "data": {
          "productId": id,
          "quantity": addTimes
        }
      }
    axios.post(`${baseUrl}/api/livejs/v1/customer/${myPath}/carts`, data)
    .then(function (response) {
      cartData = response.data.carts;
      renderCart();
    })
    .catch(function (error) {
      console.log(error);
    })
    renderCart();       
}
// 監聽按鈕: 加入購物車
productList.addEventListener('click',function (e) {
    let addBtn = e.target.getAttribute('class');
    if(addBtn !== "addCardBtn"){
        return;
    }
    e.preventDefault();  //取消a標籤預設行為
    let addId = e.target.getAttribute('data-id');
    addCartItem(addId);
})
// 清空全部購物車  
function deleteAllCart() {
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${myPath}/carts`)
    .then(function (response) {
        alert('已清空購物車!');
        getCart();
    })
    .catch(function (error) {
      alert('購物車已經沒有商品了!');
    })
}
// 監聽按鈕: 清空全部/單筆購物車
cartList.addEventListener('click',function (e) {
    e.preventDefault();  //取消a標籤預設行為
    let deleteAllBtnClass = e.target.getAttribute('class');
    let deleteItemBtnId = e.target.getAttribute('data-id');
    //清空全部
    if(deleteAllBtnClass == 'discardAllBtn'){
        deleteAllCart();
        return;
    }
    //清空單筆
    if(deleteItemBtnId == null){
        return;
    }
    deleteCartItem(deleteItemBtnId);
})
// 清空單筆購物車品項
function deleteCartItem(id){
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${myPath}/carts/${id}`)
    .then(function (response) {
      alert('已刪除該品項!');
      getCart();
    })
    .catch(function (error) {
      alert('未將該商品放入購物車!');
    })
}

// 送出訂單
const sendOrderBtn = document.querySelector('.orderInfo-btn');
sendOrderBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let cartLength = cartData.length;
    if(cartLength == 0){
        alert('購物車無商品，請加入商品!');
        return;
    }
    let orderName = document.querySelector('#customerName').value;
    let orderPhone = document.querySelector('#customerPhone').value;
    let orderEmail = document.querySelector('#customerEmail').value;
    let orderAddress = document.querySelector('#customerAddress').value;
    let orderTradeWay = document.querySelector('#tradeWay').value;
    if (orderName == '' || orderPhone == '' ||orderEmail == '' || orderAddress == ''){
        alert('請輸入完整訂單資訊');
        return;
    }
    let phoneValid = document.querySelector('[data-message="電話"]');
    if(!validatePhone(orderPhone)){
        phoneValid.textContent = '請填入正確電話格式 09XXXXXXXX';
        return;
    }else{
        phoneValid.textContent = '';
    }
    let orderInfo = {
      "name": orderName,
      "tel": orderPhone,
      "email": orderEmail,
      "address": orderAddress,
      "payment": orderTradeWay
    }
    // console.log(orderInfo);
    sendOrder(orderInfo);
    document.querySelector("#customerName").value="";
    document.querySelector("#customerPhone").value="";
    document.querySelector("#customerEmail").value="";
    document.querySelector("#customerAddress").value="";
    document.querySelector("#tradeWay").value="ATM";
})
function sendOrder(item) {  
    axios.post(`${baseUrl}/api/livejs/v1/customer/${myPath}/orders`,{
        "data": {
          "user": {
            "name": item.name,
            "tel": item.tel,
            "email": item.email,
            "address": item.address,
            "payment": item.payment
          }
        }
      })
      .then(function (response) { 
        getCart();    
      })    
}
// 驗證email格式(在游標移開時觸發 blur事件)
let orderEmail = document.querySelector('#customerEmail');
orderEmail.addEventListener('blur', function (e) {
    const emailValid = document.querySelector('[data-message="Email"]');
    if(validEmail(orderEmail.value) == false){
        emailValid.textContent = '請填入正確email格式!';
        return;
    }else{
        emailValid.textContent = '';
    }
})

// util js元件
// 千分位
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

// email驗證格式  //https://ui.dev/validate-email-address-javascript/
function validEmail (email) {
    return /\S+@\S+\.\S+/.test(email)
}
// 驗證電話
function validatePhone(phone) {
    if (/^[09]{2}\d{8}$/.test(phone)) {
      return true
    }
    return false;
}

// 修改: 刪除單筆購物車-監聽data-id  不是class   -ok
// html 改購物車列表結構 拆成 thead tbody tfoot，最後的總金額用API計算的帶入(要抓一下reponse.data回傳的資料)  --總額之後重新練習時帶入

// 原始html假資料可以刪除，安插一張Loading.gif圖片 預設載入跑資料  -ok


