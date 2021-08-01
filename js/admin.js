// const myPath = 'mlc2021';
// const baseUrl = 'https://livejs-api.hexschool.io';
// const token = "gTwcN5BJXzftlo2fmbqzgZDatLD3";

const orderList = document.querySelector(".orderList");
let orderData = [];
function init() {
    getOrderList();    
}
init();
function getOrderList() {
    axios.get(`${baseUrl}/api/livejs/v1/admin/${myPath}/orders`,{
        headers: {
          'Authorization': token
        }
    })
        .then(function (response) {
            orderData = response.data.orders;
            let str = '';
            orderData.forEach(order => {
                // 換算時間戳日期
                const timeStamp = new Date(order.createdAt*1000);
                //console.log(timeStamp);
                const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`
                // 組訂單品項字串
                let productsArray = order.products;
                let productsStr = '';
                productsArray.forEach(productItem => {
                    productsStr += `<p>${productItem.title}x${productItem.quantity}</p>`
                })
                // 判斷訂單處理狀態
                let orderStatus;
                if(order.paid == false){
                    orderStatus = '未處理';
                }else{
                    orderStatus = '已處理';
                }
                str += `<tr>
                <td>${order.id}</td>
                <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
                </td>
                <td>${order.user.address}</td>
                <td>${order.user.email}</td>
                <td>
                <p>${productsStr}</p>
                </td>
                <td>${orderTime}</td>
                <td class="orderStatus">
                <a href="#" class="js-orderStatus" data-id="${order.id}" data-status="${order.paid}">${orderStatus}</a>
                </td>
                <td>
                <input type="button" class="delSingleOrder-Btn js-deleteBtn" value="刪除" data-id="${order.id}">
                </td>
            </tr>`
            });
            orderList.innerHTML = str;
            //renderC3chart();
            renderC3Lv2()
        })
        .catch(function (error) {
          console.log(error);
        })      
}
function deleteOrderItem(id) {
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${myPath}/orders/${id}`, {
        headers: {
          'Authorization': token,
        }
      })
        .then(function(response){
          alert("刪除該筆訂單成功");
          getOrderList();
        })    
}
function deleteAllOrder() {
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${myPath}/orders`, {
        headers: {
          'Authorization': token,
        }
      })
        .then(function(response){
          alert("購物車產品已全部清空");
          getOrderList();
        })
        .catch(function (error) {
          alert("目前訂單列表沒有任何東西!");            
        })    
}
const deleteAllOrders = document.querySelector('.discardAllBtn');
deleteAllOrders.addEventListener('click',function (e) {
    e.preventDefault();
    deleteAllOrder();
    getOrderList();
})
orderList.addEventListener('click', function (e) {
    e.preventDefault();
    let targetClass = e.target.getAttribute('class');
    let orderId = e.target.getAttribute('data-id');
    if(targetClass == 'delSingleOrder-Btn js-deleteBtn'){
        deleteOrderItem(orderId);
        return;        
    }
    if(targetClass == 'js-orderStatus'){
        let status = e.target.getAttribute('data-status');
        changeOrderStatus(status,orderId);
    }
})
function changeOrderStatus(status,id) {
    // 先判斷傳入狀態，原本是false，就要改狀態為true
    let changeStatus;
    if(status == true){
        changeStatus = false;
    }else{
        changeStatus = true;
    }
    axios.put(`${baseUrl}/api/livejs/v1/admin/${myPath}/orders`,{
        "data": {
          "id": id,
          "paid": changeStatus
        }
      }, {
        headers: {
          'Authorization': token,
        }
      })
        .then(function(response){
          alert("修改該筆訂單成功");
          getOrderList();
        })
}

function renderC3chart() {
    // 物件資料整理(計算各品項總金額)
    let categoryTotalCost = {};
    orderData.forEach(function(item) {
        item.products.forEach(function (productItem) {
            if(categoryTotalCost[productItem.category] == undefined){
                categoryTotalCost[productItem.category] = productItem.price*productItem.quantity;
            }else{
                categoryTotalCost[productItem.category] += productItem.price*productItem.quantity;   
            }   
        })
    });
    //console.log(categoryTotalCost);
    //做出資料關聯(C3要的資料)
    let categoryArray = Object.keys(categoryTotalCost);
    //console.log(categoryArray);
    let c3Array = [];
    categoryArray.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(categoryTotalCost[item]);
        c3Array.push(ary);
    })
    //console.log(c3Array);
// C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: c3Array,
        colors:{
            "床架": "#DACBFF",
            "收納": "#9D7FEA",
            "窗簾": "#5434A7"
        }
        // colors:{
        //     "Louvre 雙人床架":"#DACBFF",
        //     "Antony 雙人床架":"#9D7FEA",
        //     "Anty 雙人床架": "#5434A7",
        //     "其他": "#301E5F",
        // }
    },
});    
}

function renderC3Lv2() {
    // 物件資料整理(計算各品項總金額)
    let productTotalSales = {};
    orderData.forEach(function(item) {
        item.products.forEach(function (productItem) {
            if(productTotalSales[productItem.title] == undefined){
                productTotalSales[productItem.title] = productItem.price*productItem.quantity;
            }else{
                productTotalSales[productItem.title] += productItem.price*productItem.quantity;   
            }   
        })
    });
    // console.log(productTotalSales);
    //做出資料關聯(C3要的資料)
    let productsTitleArray = Object.keys(productTotalSales);
    // console.log(productsTitleArray);
    let c3Array = [];
    productsTitleArray.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(productTotalSales[item]);
        c3Array.push(ary);
    })
    //console.log(c3Array);
    //sort() 重新排列陣列
    let sortArray = c3Array.sort(function (a,b) {
        return b[1]-a[1];
    })
    // console.log(sortArray);
    //計算其他種類加總的金額
    if(sortArray.length > 3){
        let otherTotal = 0;
        sortArray.forEach(function (item,index) {
            if(index > 2){
                otherTotal += item[1];
            }
        })
        //console.log(otherTotal);
        sortArray.splice(3, sortArray.length-3);
        c3Array.push(["其他",otherTotal]);
        c3Array.sort(function (a,b) {
            return b[1]-a[1];            
        });
        //console.log(c3Array);
    }

// C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: c3Array
    },
    color: {
        pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
//         // colors:{
//         //     "床架": "#DACBFF",
//         //     "收納": "#9D7FEA",
//         //     "窗簾": "#5434A7"
//         // }
       
    
});      
}