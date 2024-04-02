document.addEventListener('DOMContentLoaded', function() {
    const signoutLink = document.getElementById('signout-link');
    signoutLink.addEventListener('click', function(event) {
        event.preventDefault(); 

        const confirmSignout = confirm("Are you sure you want to sign out?");
        
        if (confirmSignout) {
            fetch('/signout', {
                method: 'GET',
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/signin/signin.html';
                } else {
                    console.error('Failed to sign out:', response.status);
                }
            })
            .catch(error => {
                console.error('Error during sign out:', error);
            });
        }
    });
    start()
})

function getCookie(name) {
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.startsWith(name + '=')) {
            // Decode the cookie value to replace %20 with a space
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

const userName = getCookie('user_name');

const welcomeHeading = document.getElementById('welcomeHeading');
if (userName) {
    welcomeHeading.textContent = `Welcome ${userName}`;
} else {
    welcomeHeading.textContent = 'Welcome';
}

function start() {
    
    fetch('https://orderingsystem.azurewebsites.net/api/order/get/kitchen')
        .then(response => response.json())
        .then(data => {

            const pendingOrdersElement = document.getElementById('pendingOrders');
            const preparingOrdersElement = document.getElementById('preparingOrders');
            const readyOrdersElement = document.getElementById('readyOrders');

            data.forEach(order => {

                if (order.state === 'PENDING') {
                    const orderElement = createPendingOrdersElement(order);
                    pendingOrdersElement.appendChild(orderElement);
                } else if (order.state === 'PREPARING'){
                    const orderElement = createPreparingOrdersElement(order);
                    preparingOrdersElement.appendChild(orderElement);
                } else if (order.state === 'READY'){
                    const orderElement = createReadyOrdersElement(order);
                    readyOrdersElement.appendChild(orderElement);
                }

            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

function createPendingOrdersElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.classList.add('order');
    orderDiv.innerHTML = `
        <div class="order">
            ${order.orderItems.map(orderItem => `
                <div>
                    <span>${orderItem.foodName} ${orderItem.count}</span> 
                </div>
            `).join('')}
            <button class="cancelOrderBtn">Reject</button>
            <button class="acceptOrderBtn">Accept</button>
        </div>
    `;

    const acceptOrderBtn = orderDiv.querySelector('.acceptOrderBtn');

    acceptOrderBtn.addEventListener('click', function() {

        console.log(order.orderId)
        fetch(`https://orderingsystem.azurewebsites.net/api/order/update?orderId=${order.orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status == 200){

                const pendingOrdersElement = document.getElementById('pendingOrders');
                const preparingOrdersElement = document.getElementById('preparingOrders');
                const readyOrdersElement = document.getElementById('readyOrders');

                pendingOrdersElement.innerHTML = '';
                preparingOrdersElement.innerHTML = '';
                readyOrdersElement.innerHTML = '';

                start();

            } else {
                throw new Error('Unexpected response');
            }
        })
        .catch(error => {
            alert("An error occurred while processing your request.");
            console.error('Error:', error);
        });

    });

    const cancelOrderBtn = orderDiv.querySelector('.cancelOrderBtn');

    cancelOrderBtn.addEventListener('click', function() {
        fetch(`https://orderingsystem.azurewebsites.net/api/order/cancel?orderId=${orde.orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status == 200){

                const pendingOrdersElement = document.getElementById('pendingOrders');
                const preparingOrdersElement = document.getElementById('preparingOrders');
                const readyOrdersElement = document.getElementById('readyOrdersOrders');

                pendingOrdersElement.innerHTML = '';
                preparingOrdersElement.innerHTML = '';
                readyOrdersElement.innerHTML = '';

                start();

            } else {
                throw new Error('Unexpected response');
            }
        })
        .catch(error => {
            alert("An error occurred while processing your request.");
            console.error('Error:', error);
        });

    });

    return orderDiv;
}

function createPreparingOrdersElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.classList.add('order');
    orderDiv.innerHTML = `
        <div class="order">
            ${order.orderItems.map(orderItem => `
                <div>
                    <span>${orderItem.foodName} ${orderItem.count}</span> 
                </div>
            `).join('')}
            <button class="readyOrderBtn">Ready</button>
        </div>
    `;

    const readyOrderBtn = orderDiv.querySelector('.readyOrderBtn');

    readyOrderBtn.addEventListener('click', function() {

        fetch(`https://orderingsystem.azurewebsites.net/api/order/update?orderId=${order.orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status == 200){

                const pendingOrdersElement = document.getElementById('pendingOrders');
                const preparingOrdersElement = document.getElementById('preparingOrders');
                const readyOrdersElement = document.getElementById('readyOrders');

                pendingOrdersElement.innerHTML = '';
                preparingOrdersElement.innerHTML = '';
                readyOrdersElement.innerHTML = '';

                start();

            } else {
                throw new Error('Unexpected response');
            }
        })
        .catch(error => {
            alert("An error occurred while processing your request.");
            console.error('Error:', error);
        });

    });

    return orderDiv;
}

function createReadyOrdersElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.classList.add('order');
    orderDiv.innerHTML = `
        <div class="order">
            <span>Table Nnmber: ${order.tableNumber}</span> 
            ${order.orderItems.map(orderItem => `
                <div>
                    <span>${orderItem.foodName} ${orderItem.count}</span> 
                </div>
            `).join('')}
        </div>
    `;
    return orderDiv;
}