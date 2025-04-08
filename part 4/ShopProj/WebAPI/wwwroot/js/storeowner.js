const baseUrl = `${window.location.origin}/StoreOwner`;
let productList = [];
let allOrdersData = [];
let displayedOrders = 0;

let statusOrdersData = [];
let displayedStatusOrders = 0;

function addProduct() {
    const productName = document.getElementById("productName").value;
    const productQuantity = document.getElementById("productQuantity").value;

    if (!productName || !productQuantity) {
        displayError("אנא מלא את שם המוצר והכמות.");
        return;
    }

    let existingProduct = productList.find(product => product.name === productName);
    if (existingProduct) {
        existingProduct.quantity += parseInt(productQuantity);
    } else {
        productList.push({ name: productName, quantity: parseInt(productQuantity) });
    }

    document.getElementById("productName").value = "";
    document.getElementById("productQuantity").value = "";

    displayProductList();
}

function displayProductList() {
    const productListContainer = document.getElementById("productList");
    productListContainer.innerHTML = `
        <div class="product-item">
            <input type="text" id="productName" placeholder="שם המוצר" />
            <input type="number" id="productQuantity" placeholder="כמות" />
            <button onclick="addProduct()">הוסף מוצר</button>
        </div>
    `;

    productList.forEach(product => {
        productListContainer.innerHTML += `
            <div class="product-item">
                <input type="text" value="${product.name}" disabled />
                <input type="number" value="${product.quantity}" disabled />
                <button onclick="removeProduct('${product.name}')">הסר</button>
            </div>
        `;
    });
}

function removeProduct(productName) {
    productList = productList.filter(product => product.name !== productName);
    displayProductList();
}

function parseGoods() {
    const result = {};
    productList.forEach(item => {
        result[item.name] = item.quantity;
    });
    return result;
}

async function createOrder() {
    const companyInput = document.getElementById("supplierName");
    const company = companyInput.value;

    if (!company || productList.length === 0) {
        displayError("אנא מלא את שם הספק והוסף מוצרים.");
        return;
    }

    const goods = parseGoods();
    const query = new URLSearchParams();

    for (let key in goods) {
        query.append(key, goods[key]);
    }

    try {
        const response = await fetch(`${baseUrl}/CreateOrder?${query.toString()}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(company)
        });

        const text = await response.text();

        if (response.ok) {
            alert("ההזמנה נוצרה בהצלחה: " + text);
            resetOrderInputs();
            await getAllOrders();
        } else {
            if (response.status === 404 || text.toLowerCase().includes("supplier") || text.toLowerCase().includes("not found") || text.includes("ספק לא קיים")) {
                displayError(`הספק "${company}" לא נמצא במערכת. אנא וודא שהכנסת שם ספק תקין.`);
            }
            else if (text.includes("not found for this supplier")) {
                const productName = text.match(/Good '(.+)' not found/);
                if (productName && productName[1]) {
                    displayError(`המוצר '${productName[1]}' לא נמצא אצל הספק הזה.`);
                } else {
                    displayError("אחד המוצרים לא נמצא אצל הספק הזה.");
                }
            
            } else if (text.includes("less than the minimum required quantity")) {
                const match = text.match(/The quantity for '(.+)' is less than the minimum required quantity of (\d+)/);
                if (match && match[1] && match[2]) {
                    displayError(`הכמות עבור המוצר '${match[1]}' פחותה מהכמות המינימלית הנדרשת של ${match[2]}.`);
                } else {
                    displayError("הכמות שהוזנה נמוכה מהכמות המינימלית הנדרשת לאחד המוצרים.");
                }
            } else if (response.status === 409) {
                displayError("שגיאה: " + text);
            } else if (response.status === 400) {
                displayError("נכשל ביצירת ההזמנה: " + text);
            } else {
                displayError("שגיאה בהוספת ההזמנה: " + text);
                console.error("פרטי השגיאה:", {
                    status: response.status,
                    text: text
                });
            }
        }

    } catch (error) {
        displayError("שגיאה בחיבור לשרת.");
        console.error("שגיאה:", error);
    }
}

function resetOrderInputs() {
    document.getElementById("supplierName").value = "";

    productList = [];
    displayProductList();
}

async function approveOrder() {
    const approveInput = document.getElementById("approveOrderId");
    const id = approveInput.value;

    if (!id) {
        displayError("אנא הכנס מספר הזמנה לאישור.");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/ApproveOrder?id=${id}`, {
            method: "PUT"
        });

        const text = await response.text();

        if (response.ok) {
            alert("ההזמנה אושרה בהצלחה: " + text);
            approveInput.value = "";
            await getAllOrders();
            await getStatusOrders(); 
        } else {
            if (response.status === 404 || text.toLowerCase().includes("order not found") || text.includes("הזמנה לא קיימת")) {
                displayError(`הזמנה מספר ${id} לא נמצאה במערכת.`);
            } else {
                displayError("האישור נכשל: " + text);
            }
        }

    } catch (error) {
        displayError("אירעה שגיאה באישור ההזמנה.");
    }
}

async function getAllOrders() {
    try {
        const res = await fetch(`${baseUrl}/AllOrders`);
        if (res.ok) {
            allOrdersData = await res.json();
            allOrdersData.sort((a, b) => b.orderId - a.orderId);

            displayedOrders = 6;
            displayOrders(displayedOrders);
        } else {
            const errorText = await res.text();
            displayError("שגיאה בטעינת ההזמנות: " + errorText);
        }
    } catch (error) {
        displayError("שגיאה בחיבור לשרת בעת טעינת ההזמנות.");
    }
}

function displayOrders(count) {
    const container = document.getElementById("allOrders");
    container.innerHTML = "";

    if (allOrdersData.length === 0) {
        container.innerHTML = "<p>אין הזמנות להצגה</p>";
        return;
    }

    const ordersToDisplay = allOrdersData.slice(0, count);

    ordersToDisplay.forEach(order => {
        const div = document.createElement("div");
        div.className = "order";

        let goodsHtml = "";
        if (order.goods && order.goods.length > 0) {
            goodsHtml = "<ul>";
            order.goods.forEach(item => {
                const totalPrice = item.quantity * item.price;
                goodsHtml += `<li style="margin-bottom: 10px;">• ${item.productName} - כמות: ${item.quantity}, מחיר ליחידה: ₪${item.price}, סה"כ: ₪${totalPrice.toFixed(2)}</li>`;
            });
            goodsHtml += "</ul>";
        } else {
            goodsHtml = "<p>אין מוצרים בהזמנה</p>";
        }

        div.innerHTML = `
            <strong>הזמנה #${order.orderId}</strong><br/>
            <strong>סטטוס:</strong> ${order.orderStatus}<br/>
            <strong>ספק:</strong> ${order.companyName}<br/>
            <strong>תאריך:</strong> ${order.orderDate}<br/>
            <strong>מוצרים:</strong><br/>${goodsHtml}
        `;
        container.appendChild(div);
    });

    if (displayedOrders < allOrdersData.length) {
        const showMoreButton = document.createElement("button");
        showMoreButton.innerText = "הצג עוד";
        showMoreButton.onclick = loadMoreOrders;
        container.appendChild(showMoreButton);
    }
}

function loadMoreOrders() {
    displayedOrders += 6;
    displayOrders(displayedOrders);
}

async function getStatusOrders() {
    try {
        const res = await fetch(`${baseUrl}/StatusOrders`);
        if (res.ok) {
            statusOrdersData = await res.json();
            statusOrdersData.sort((a, b) => b.orderId - a.orderId);

            displayedStatusOrders = 6;
            displayStatusOrders(displayedStatusOrders);
        } else {
            const errorText = await res.text();
            displayError("שגיאה בטעינת סטטוס ההזמנות: " + errorText);
        }
    } catch (error) {
        displayError("שגיאה בחיבור לשרת בעת טעינת סטטוס ההזמנות.");
    }
}

function displayStatusOrders(count) {
    const container = document.getElementById("statusOrders");
    container.innerHTML = "";

    if (statusOrdersData.length === 0) {
        container.innerHTML = "<p>אין הזמנות להצגה</p>";
        return;
    }

    const ordersToDisplay = statusOrdersData.slice(0, count);

    ordersToDisplay.forEach(order => {
        const div = document.createElement("div");
        div.className = "order";
        div.innerHTML = `
            <strong>הזמנה #${order.orderId}</strong><br/>
            <strong>סטטוס:</strong> ${order.status}<br/>
            <strong>ספק:</strong> ${order.companyName}<br/>
            <strong>תאריך:</strong> ${order.orderDate}
        `;
        container.appendChild(div);
    });

    if (displayedStatusOrders < statusOrdersData.length) {
        const showMoreButton = document.createElement("button");
        showMoreButton.innerText = "הצג עוד";
        showMoreButton.onclick = loadMoreStatusOrders;
        container.appendChild(showMoreButton);
    }
}

function loadMoreStatusOrders() {
    displayedStatusOrders += 6;
    displayStatusOrders(displayedStatusOrders);
}

function displayError(message) {
    alert("שגיאה: " + message);
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        await getAllOrders();
        await getStatusOrders();
    } catch (error) {
        displayError("שגיאה בטעינת הנתונים הראשונית.");
    }
});