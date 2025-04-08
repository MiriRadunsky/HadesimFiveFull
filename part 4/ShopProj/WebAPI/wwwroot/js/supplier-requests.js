const baseUrl = `${window.location.origin}/Suppliers`;

const company = localStorage.getItem('supplierCompany');
const minQuantity = 10;

const title = document.getElementById("pageTitle");

if (company) {
    title.textContent = `ברוך הבא, ${company}`;
} else {
    title.textContent = "ניהול ספק";
    displayError("לא נמצאו פרטי ספק. נא להתחבר מחדש.");
    window.location.href = "supplier-login.html";
}

const goodsMap = {};
let displayedOrders = 0;
const ordersPerPage = 6;

function displayError(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
    alert(message);
    resetInputFields();
}

function addToList() {
    const name = document.getElementById("goodName").value.trim();
    const quantity = parseFloat(document.getElementById("goodQuantity").value);
    const price = parseFloat(document.getElementById("goodPrice").value);

    if (!name || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
        displayError("נא להזין שם, כמות ומחיר חוקיים.");
        return;
    }

    goodsMap[name] = {
        quantity: quantity,
        price: price
    };

    updateGoodsListUI();
    resetInputFields();
}

function resetInputFields() {
    document.getElementById("goodName").value = "";
    document.getElementById("goodQuantity").value = "";
    document.getElementById("goodPrice").value = "";
}

function updateGoodsListUI() {
    const ul = document.getElementById("goodsList");
    ul.innerHTML = "";
    for (const [name, data] of Object.entries(goodsMap)) {
        const li = document.createElement("li");
        li.className = "good-item";
        li.textContent = `${name} - כמות: ${data.quantity}, מחיר ליחידה: ₪${data.price}`;
        ul.appendChild(li);
    }
}

async function submitGoods() {
    if (Object.keys(goodsMap).length === 0) {
        displayError("לא נוספו מוצרים.");
        return;
    }

    const queryParams = new URLSearchParams({
        company: company,
        quantity: minQuantity
    });

    const goodsQuantitiesOnly = {};
    for (const [name, data] of Object.entries(goodsMap)) {
        goodsQuantitiesOnly[name] = data.quantity;
    }

    try {
        const response = await fetch(`${baseUrl}/AddGoodsToSupplier?${queryParams.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goodsQuantitiesOnly)
        });

        if (response.ok) {
            alert("הסחורה נוספה בהצלחה!");
            resetInputFields();
            for (let key in goodsMap) delete goodsMap[key];
            updateGoodsListUI();
        } else if (response.status === 409) {
            const errorText = await response.text();
            displayError("שגיאה: " + errorText);
        } else if (response.status === 404) {
            displayError("הספק לא נמצא. אנא וודא שאתה מחובר לחשבון הנכון.");
        } else if (response.status === 400) {
            const errorText = await response.text();
            displayError("נכשל ביצירת הזמנה: " + errorText);
        } else {
            const errorText = await response.text();
            displayError("שגיאה בהוספת הסחורה: " + errorText);
        }
    } catch (error) {
        displayError("שגיאה בחיבור לשרת.");
        console.error("שגיאה:", error);
    }
}

async function fetchOrders() {
    try {
        const response = await fetch(`${baseUrl}/AllOrdersForSupplier?company=${encodeURIComponent(company)}`);
        const orders = await response.json();
        const container = document.getElementById("ordersContainer");
        container.innerHTML = "";

        if (orders.length === 0) {
            container.innerText = "אין הזמנות להצגה.";
            return;
        }

        orders.sort((a, b) => b.orderId - a.orderId);

        displayOrders(orders.slice(displayedOrders, displayedOrders + ordersPerPage));

        if (orders.length > displayedOrders + ordersPerPage) {
            const showMoreButton = document.createElement("button");
            showMoreButton.innerText = "הצג עוד";
            showMoreButton.onclick = () => loadMoreOrders(orders, showMoreButton);
            container.appendChild(showMoreButton);
        }

    } catch (error) {
        displayError("שגיאה בטעינה.");
        console.error("שגיאה בטעינת הזמנות:", error);
    }
}

function displayOrders(orders) {
    const container = document.getElementById("ordersContainer");

    orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "order";

        div.innerHTML = `
            <p><strong>מזהה הזמנה:</strong> ${order.orderId}</p>
            <p><strong>סטטוס הזמנה:</strong> ${order.orderStatus === 'waiting' ? 'ממתינה' : 'בתהליך'}</p>
            <p><strong>תאריך הזמנה:</strong> ${order.orderDate}</p>
            <p><strong>פריטים:</strong></p>
            <ul>${order.goods.map(good => `<li>• ${good.productName}- כמות: ${good.quantity}</li>`).join("")}</ul>
            ${order.orderStatus === 'waiting' ? `<button onclick="markInProgress(${order.orderId})">סמן כבתהליך</button>` : ''}
        `;
        container.appendChild(div);
    });

    displayedOrders += orders.length;
}

function loadMoreOrders(orders, showMoreButton) {
    const remainingOrders = orders.slice(displayedOrders, displayedOrders + ordersPerPage);
    displayOrders(remainingOrders);
    if (orders.length <= displayedOrders + ordersPerPage) {
        showMoreButton.remove();
    }
}

async function markInProgress(orderId) {
    try {
        const response = await fetch(`${baseUrl}/InProgressOrder?id=${orderId}`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert("ההזמנה סומנה כבתהליך.");

            const orderElement = [...document.querySelectorAll('.order')]
                .find(div => div.innerHTML.includes(`מזהה הזמנה:</strong> ${orderId}`));

            if (orderElement) {
                const statusParagraph = orderElement.querySelector("p:nth-child(2)");
                if (statusParagraph) {
                    statusParagraph.innerHTML = `<strong>סטטוס הזמנה:</strong> בתהליך`;
                }
                const button = orderElement.querySelector("button");
                if (button) {
                    button.remove();
                }
            }
        } else {
            displayError("שגיאה בסימון ההזמנה.");
        }
    } catch (error) {
        displayError("שגיאה בסימון ההזמנה.");
        console.error("שגיאה בסימון:", error);
    }
}

fetchOrders();
