document.addEventListener('DOMContentLoaded', function() {
    start()
})

function getCookie(name) {
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
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
    
    fetch('http://localhost:3000/api/table/getAll')
        .then(response => response.json())
        .then(data => {

            const readyOrderElement = document.getElementById('readyOrders');
            const watingOrderElement = document.getElementById('waitingOrders');
            const deliveredOrderElement = document.getElementById('deliveredOrders');

            readyOrderElement.innerHTML='';
            watingOrderElement.innerHTML='';
            deliveredOrderElement.innerHTML='';

            data.tables.forEach(table => {

                console.log(table.state)
                if (table.state === 'ORDERING') {
                    const tableElement = createTableCard(table);
                    readyOrderElement.appendChild(tableElement);
                } else if (table.state ===  'WAITING_FOR_FOOD'){
                    const tableElement = createWaitingTableElement(table);
                    watingOrderElement.appendChild(tableElement);
                } else if (table.state ===  'DELIVERED'){
                    const tableElement = createDeliveredTableElement(table);
                    deliveredOrderElement.appendChild(tableElement);
                }

            });
        })
        .catch(error => console.error('Error fetching tables:', error));
}

function createDeliveredTableElement(table){

    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table');

    const tableNumber = document.createElement('span');
    tableNumber.classList.add('table-number');
    tableNumber.textContent = `Table ${table.number}`;
    tableDiv.appendChild(tableNumber);

    tableDiv.style.backgroundColor=`rgb(220, 162, 239)`;

    return tableDiv;
}

function createWaitingTableElement(table){

    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table');

    const tableNumber = document.createElement('span');
    tableNumber.classList.add('table-number');
    tableNumber.textContent = `Table ${table.number}`;
    tableDiv.appendChild(tableNumber);

    fetch(`http://localhost:3000/api/order/get/table?tableNumber=${table.number}`)
        .then(response=>{
            if (response.status == 200){
                const tableOrder = document.createElement('div');
                tableOrder.classList.add('table-order');
                tableOrder.id = `order-${table.number}`
                response.json().then(res => {
                    console.log(res);
                    res.order_items.forEach(order=>{
                        const foodNameOrdered = document.createElement('span');
                        foodNameOrdered.classList.add('foodName-ordered');
                        foodNameOrdered.textContent = `${order.foodId.name} ${order.count}`;
                        tableOrder.appendChild(foodNameOrdered);
                    })
                    if (res.state == 'PENDING'){
                        tableDiv.style.backgroundColor='rgb(255, 255, 170)';
                        const cancelOrderBtn = document.createElement('button');
                        cancelOrderBtn.textContent = 'Cancel'; 
                        cancelOrderBtn.classList.add('cancel-order-btn'); 
                        tableOrder.appendChild(cancelOrderBtn);
                        cancelOrderBtn.addEventListener('click', function() {
                            fetch(`http://localhost:3000/api/order/cancel?orderId=${res._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(respond => {
                                if (respond.status == 200){
                                    fetch(`http://localhost:3000/api/table/empty?number=${table.number}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    }).then(ans => {
                                        if (ans.status == 200){
                                            const messageElement = document.createElement('p');
                                            messageElement.textContent = "Order is canceled!";
                                            const messageContainer = document.getElementById('messageContainer');
                                            messageContainer.innerHTML='';
                                            messageContainer.appendChild(messageElement);
                                            messageContainer.style.display='flex'
                                            start();
                                        }
                                        else{
                                            throw new Error(`Make table Empty API status code: ${ans.status}`);
                                        }
                                    })
                                }
                                else{
                                    throw new Error(`Cancel Order API status code: ${respond.status}`);
                                }
                            }).catch(error => {
                                alert("Internal Server Error. Please try again later");
                                console.error('Error:', error);
                            });
                        });

                    }
                    else if(res.state == 'PREPARING'){
                        tableDiv.style.backgroundColor=`rgb(170, 232, 255)`;
                    }
                    else if (res.state == 'READY'){

                        tableDiv.style.backgroundColor=`rgb(148, 250, 134)`;

                        const deliverOrderBtn = document.createElement('button');
                        deliverOrderBtn.textContent = 'Deliver'; 
                        deliverOrderBtn.classList.add('deliver-order-btn'); 

                        tableDiv.appendChild(deliverOrderBtn);

                        deliverOrderBtn.addEventListener('click', function() {
                            fetch(`http://localhost:3000/api/table/state?number=${table.number}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(respond=>{
                                if (respond.status == 200){
                                    start();
                                }else{
                                    throw new Error(`Update Table State API status code: ${response.status}`);
                                }
                            })
                        })
                        
                    }
                })
                tableDiv.appendChild(tableOrder)
                tableOrder.style.display = 'none';
            }
            else{
                throw new Error(`Waititng table creating failed: ${response.status}`);
            }

    }).catch(error => {
        alert("Internal Server Error. Please try again later");
        console.error('Error:', error);
    });
    
    tableDiv.addEventListener('click', function() {
        const tableOrderElement = document.getElementById(`order-${table.number}`);
        if (tableOrderElement.style.display === 'none') {
            tableOrderElement.style.display = 'flex';
        } else {
            tableOrderElement.style.display = 'none';
        }
    });

    return tableDiv;
}

function createTableCard (table) {

    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table');
    
    const tableNumber = document.createElement('span');
    tableNumber.classList.add('table-number');
    tableNumber.textContent = `Table ${table.number}`;

    tableDiv.appendChild(tableNumber);
    
    tableDiv.addEventListener('click', function() {
        
        const tableContainerElement = document.getElementById('tableContainer');
        const orderFoodElement = document.getElementById('orderContainer');

        tableContainerElement.style.display = 'none';
        orderFoodElement.style.display = 'contents';
        createOrderCard(table);
    });

    return tableDiv;

}

function createOrderCard(table){

    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerHTML='';
    messageContainer.style.display='none';

    const tableNumberEllement = document.getElementById('tableHead');
    tableNumberEllement.textContent=`Table ${table.number}`

    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {

        const tableContainerElement = document.getElementById('tableContainer');
        const orderFoodElement = document.getElementById('orderContainer');
        const orders = document.getElementById('order');
        orders.innerHTML='';

        tableContainerElement.style.display = 'flex';
        orderFoodElement.style.display = 'none';
    });

    const makeOrderBtn = document.getElementById('makeOrderBtn');
    makeOrderBtn.addEventListener('click', function() {
        
        const orderFoods = document.querySelectorAll('#order .food');
        
        let orderItems = [];

        orderFoods.forEach(food => {
            const foodId = food.dataset.foodId;
            const count = parseInt(food.querySelector('.count').textContent);
            orderItems.push({foodId: foodId, count: count});
        });

        const order = {table_number: table.number, order_items: orderItems};


        fetch('http://localhost:3000/api/order/create ', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)

        })
        .then(response => {
            if (response.status == 201) {

                fetch(`http://localhost:3000/api/table/state?number=${table.number}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(respond => {

                    if (respond.status == 200){

                        const messageElement = document.createElement('p');
                        messageElement.textContent = "Order has been successfully placed!";
                        const messageContainer = document.getElementById('messageContainer');
                        messageContainer.innerHTML='';
                        messageContainer.appendChild(messageElement);
                        messageContainer.style.display='flex'

                        const tableContainerElement = document.getElementById('tableContainer');
                        const orderFoodElement = document.getElementById('orderContainer');
                        const orders = document.getElementById('order');
                        orders.innerHTML='';

                        tableContainerElement.style.display = 'flex';
                        orderFoodElement.style.display = 'none';
                        
                        start()

                    }
                    else{
                        throw new Error(`Order creation failed with table API status code: ${respond.status}`);
                    }
                })
            }
            else{
                throw new Error(`Order creation failed with order API status code: ${response.status}`);
            }

        })
        .catch(error => {
            alert("Internal Server Error. Please try again later");
            console.error('Error:', error);
        });
    })

    fetch('http://localhost:3000/api/food/getBy?category=BEVERAGE')
        .then(response => response.json())
        .then(data => {
            createFoodcard(data);
    });


    const beverageBtn = document.getElementById('beverageBtn');
    beverageBtn.addEventListener('click', function() {
        fetch('http://localhost:3000/api/food/getBy?category=BEVERAGE')
        .then(response => response.json())
        .then(data => {
            createFoodcard(data);
        })
    });

    const appetizerBtn = document.getElementById('appetizerBtn');
    appetizerBtn.addEventListener('click', function() {
        fetch('http://localhost:3000/api/food/getBy?category=APPETIZER')
        .then(response => response.json())
        .then(data => {
            createFoodcard(data);
        })
    });

    const foodBtn = document.getElementById('foodBtn');
    foodBtn.addEventListener('click', function() {
        fetch('http://localhost:3000/api/food/getBy?category=FOOD')
        .then(response => response.json())
        .then(data => {
            createFoodcard(data);
        })
    }); 

    const dessertBtn = document.getElementById('dessertBtn');
    dessertBtn.addEventListener('click', function() {
        fetch('http://localhost:3000/api/food/getBy?category=DESSERT')
        .then(response => response.json())
        .then(data => {
            createFoodcard(data);
        })
    }); 
}

function createFoodcard (data){
    
    const foodsDiv = document.getElementById('foodsDiv');
    
    foodsDiv.innerHTML = '';

    data.foods.forEach(food => {
  
        const existingFood = document.getElementById(food.name);
        if (!existingFood) {

            const foodName = document.createElement('span');
            foodName.classList.add(`food-name`);
            foodName.textContent = `${food.name}`;

            const foodDiv = document.createElement('div');
            foodDiv.classList.add('food');
            foodDiv.id = food.name;
            foodDiv.dataset.foodId = food._id;

            const countElement = document.createElement('span');
            countElement.classList.add('count');
            countElement.textContent = '1'; 

            const decrementButton = document.createElement('button');
            decrementButton.textContent = '-';
            decrementButton.id = "decrementBtn";

            foodsDiv.appendChild(foodDiv);
            foodDiv.appendChild(foodName);
            foodDiv.appendChild(countElement);
            foodDiv.appendChild(decrementButton);

            countElement.style.display = 'none';
            decrementButton.style.display = 'none';

            foodDiv.addEventListener('click', function() {
                if (this.parentElement.id === 'order') {
                    countElement.textContent = parseInt(countElement.textContent) + 1;
                } else {
                    foodsDiv.removeChild(foodDiv)
                    const orders = document.getElementById('order');
                    orders.appendChild(foodDiv);
                    countElement.style.display = 'flex';
                    decrementButton.style.display = 'flex';
                }
            });

            decrementButton.addEventListener('click', function(event) {
                event.stopPropagation();
                const count = parseInt(countElement.textContent);
                if (count > 1) {
                    countElement.textContent = count - 1;
                } else {
                    const orders = document.getElementById('order');
                    orders.removeChild(foodDiv);
                    foodsDiv.appendChild(foodDiv);
                    countElement.style.display = 'none';
                    decrementButton.style.display = 'none';
                }
            });
        }
    });
}