// var product = [{
//     id: 1,
//     img:'https://th.bing.com/th/id/R.ccfa61a1cfd37bfe6a973ea25e4cd1b0?rik=FRHD3WsJAiukbQ&pid=ImgRaw&r=0',
//     name: 'Black-Red Vlone Hoodie',
//     price: 1500,
//     description: 'vlone drrr derrere derer',
//     type: 'hoodie'
// } , {
//     id: 2,
//     img:'https://5.imimg.com/data5/SELLER/Default/2024/1/379639490/DH/QA/TQ/7721879/pngtree-isolated-blank-t-shirt-front-png-image-13326528-500x500.png',
//     name:'White shirt',
//     price: 500,
//     description:'White shirt lorem lorem',
//     type:'shirt'
// } , {
//     id: 3,
//     img:'https://cf.shopee.co.th/file/e4543e3ed029ed646b7675e943e3e5f0',
//     name:'Black pant',
//     price: 2100,
//     description:'Pant lorem lorem',
//     type:'pant'
// }];

var product;

$(document).ready(()=>{

    $.ajax({
        method: "GET",
        url: "http://localhost:3000/products",  // ✅ เรียก API /products
        success: function (response) {
            console.log(response); // ✅ ดูข้อมูลที่ได้จาก API ใน Console
            // displayProducts(response.Result); // ✅ เรียกฟังก์ชันแสดงข้อมูล
            if(response.RespCode == 200) {

                product = response.Result;

                var html ='';
                for (let i = 0; i< product.length ; i++) {
                    html += `<div onclick="openProductDetail(${i})" class="product-items ${product[i].type}">
                                <img class="product-img" src="./imgs/${product[i].img}" alt="">
                                <p style="font-size: 1.2vw;">${product[i].name}</p>
                                <p style="font-size: 1vw;">${numberWithCommas(product[i].price)} THB</p>
                            </div>`;
                }
                $("#productlist").html(html);
            }
        }, error: function (err) {
            console.log("Error:", err);
        },
    });
})

function numberWithCommas(x){
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern,"$1,$2");
    return x;
}

function searchsomething(elem){
    var value = $(`#`+elem.id).val()

    var html ='';
    for (let i = 0; i< product.length ; i++) {
        if(product[i].name.includes(value)){
            html += `<div onclick="openProductDetail(${i})" class="product-items ${product[i].type}">
                    <img class="product-img" src="./imgs/${product[i].img}" alt="">
                    <p style="font-size: 1.2vw;">${product[i].name}</p>
                    <p style="font-size: 1vw;">${numberWithCommas(product[i].price)} THB</p>
                </div>`;
        }

    }
    if(html == ''){
        $("#productlist").html(`<p>Not found product</p>`);
    }else{
        $("#productlist").html(html);
    }
}

function searchproduct(param){
    $(".product-items").css('display', 'none')
    if(param =='all'){
        $(".product-items").css('display', 'block')
    }
    else{
        $("."+param).css('display', 'block')
    }
}
var productindex = 0;
function openProductDetail(index){
    productindex = index;
    $("#modalDesc").css('display','flex')
    $("#mdd-img").attr('src','./imgs/' + product[index].img);
    $("#mdd-name").text(product[index].name)
    $("#mdd-price").text(numberWithCommas(product[index].price) + ' THB')
    $("#mdd-desc").text(product[index].description)
}

function closeModal(){
    $(".modal").css('display','none')
}

var cart = [];
function addtocart(){
    var pass = true;
    
    for (let i = 0; i < cart.length; i++) {
        if(productindex == cart[i].index){
            cart[i].count++;
            pass = false;
        }
    }

    if(pass){
        var obj ={
            index: productindex,
            id: product[productindex].id,
            name: product[productindex].name,
            price: product[productindex].price,
            img: product[productindex].img,
            count: 1
        };
        cart.push(obj)
    }
    Swal.fire({
        icon: 'success',
        title: 'เพิ่ม ' + product[productindex].name+ ' ลงตะกร้าสินค้าของคุณแล้ว !'
    })
    $("#cartcount").css('display','flex').text(cart.length)
}

function openCart(){
    $('#modalCart').css('display','flex')
    rendercart();
}

function rendercart(){
    if(cart.length > 0){
        var html = '';
        for (let i = 0; i < cart.length; i++) {
            html +=`<div class="cartlist-items">
                        <div class="cartlist-left">
                            <img src="./imgs/${cart[i].img}" alt="">
                            <div class="cartlist-detail">
                                <p style="font-size: 1.5vw;">${cart[i].name}</p>
                                <p style="font-size: 1.2vw;">${numberWithCommas(cart[i].price * cart[i].count)  }  THB</p>
                            </div>
                        </div>
                        <div class="cartlist-right">
                            <p  onclick="deinitems('-',${i})" class="btnc">-</p>
                            <p id="countitems${i}" style="margin: 0 20px;">${cart[i].count}</p>
                            <p onclick="deinitems('+',${i})" class="btnc">+</p>
                        </div>
                    </div>`;  
        }
        $("#mycart").html(html)
    }
    else {
        $("#mycart").html('<p>ไม่มีสินค้าในตะกร้าของคุณ</p>')
    }
}

function deinitems(action,index){
    if(action =='-'){
        if(cart[index].count > 0){
            cart[index].count--;
            $("#countitems"+index).text(cart[index].count)
            rendercart()
            if(cart[index].count <= 0){
                Swal.fire({
                    icon: 'warning',
                    title: 'ยืนยันการลบสินค้า ?',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'ยืนยันการลบ',
                    cancelButtonText: 'ยกเลิกการลบ'
                }).then((res) =>{
                    if(res.isConfirmed){
                        cart.splice(index,1)
                        rendercart();
                        $("#cartcount").css('display','flex').text(cart.length)
                        if(cart.length <= 0){
                            $("#cartcount").css('display','none')
                        }
                    }
                    else{
                        cart[index].count++;
                        $("#countitems"+index).text(cart[index].count)
                        rendercart()
                    }
                })
            }
        }
    }
    else if(action =='+'){
        cart[index].count++;
        $("#countitems"+index).text(cart[index].count)
        rendercart()
    }

}

document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggleSidebar");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const navContainer = document.querySelector(".nav-container");


    
    toggleButton.addEventListener("click", function () {
        if (sidebar.style.display === "none" || sidebar.style.display === "") {
            sidebar.style.display = "flex"; // แสดง Sidebar
            mainContent.style.width = "80%"; // กลับไปขนาดเดิม
            navContainer.style.marginLeft = "0"; // กลับตำแหน่งเดิม

        } else {
            sidebar.style.display = "none"; // ซ่อน Sidebar
            mainContent.style.width = "100%"; // ขยายเต็มจอ
            navContainer.style.marginLeft = "20px"; // เลื่อนไปทางซ้าย

        }
    });
});

function buynow() {
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/calculate-price", // ✅ ใช้ URL ที่ถูกต้อง
        contentType: "application/json", // ✅ แจ้งว่าเป็น JSON
        data: JSON.stringify({
            product: cart // ✅ แปลง cart เป็น JSON
        }),
        success: function(response) {
            console.log("Response:", response);
            if(response.RespCode == 200) {
                Swal.fire({
                    icon:'warning',
                    title: 'ยืนยันการซื้อสินค้าของคุณ',
                    html: ` <p>ราคาสินค้า : ${response.Amount} บาท</p>
                            <p>ราคารวมค่าจัดส่ง 60บาท : ${response.Shipping} บาท </p>
                            <p>ค่าธรรมเนียม[7%](VAT) : ${response.VAT} บาท </p>
                            <p style="font-weight: bold;">ราคารวม : ${response.NetAmount} บาท </p>
                            `,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'ชำระเงิน',
                    cancelButtonText: 'ยกเลิก'
                }).then((res)=>{
                    if(res.isConfirmed){
                        window.location.href = "order.html";
                    }
                    // if(res.isConfirmed){
                    //     cart = [];
                    //     closeModal();
                    //     $("#cartcount").css('display','none');
                    // }
                    else if(res.dismiss === Swal.DismissReason.cancel){
                        // 📌 ถ้ากด "ยกเลิก" ให้ลบ Transaction ออก
                        $.ajax({
                            method: "DELETE",
                            url: `http://localhost:3000/cancel-transaction/${response.TransactionID}`,
                            success: function(deleteResponse) {
                                console.log("Transaction Cancelled:", deleteResponse);
                            },
                            error: function(err) {
                                console.log("Error cancelling transaction:", err);
                            }
                        });
                    }
                });
            }
            else{
                Swal.fire({
                    icon:'error',
                    title: 'มีบางอย่างผิดปกติ โปรดลองใหม่อีกครั้ง',
                })
            }
        },
        error: function(err) {
            console.log("Error:", err);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html"; // ✅ ถ้าไม่ได้ Login ให้กลับไปหน้า Login
    } else {
        console.log("User Logged In:", user);
        document.getElementById("welcomeMessage").innerText = `Welcome, ${user.username}!`;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const userDisplay = document.getElementById("userDisplay");
    const userData = localStorage.getItem("user");
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.username) {
                console.log("✅ User Logged In:", user.username);
                userDisplay.innerText = user.username; // ✅ แสดงชื่อผู้ใช้
            } else {
                console.log("❌ Username is missing in user data.");
                userDisplay.innerText = "Guest"; // ❌ ถ้าไม่มี username ให้แสดง "Guest"
            }
        } catch (error) {
            console.error("❌ Error parsing user data:", error);
            userDisplay.innerText = "Guest"; // ❌ ถ้า JSON ผิดพลาด ให้แสดง "Guest"
        }
    } else {
        console.log("❌ No user logged in");
        userDisplay.innerText = "Login"; // ❌ ถ้ายังไม่ได้ Login ให้แสดง "Login"
    }
});
