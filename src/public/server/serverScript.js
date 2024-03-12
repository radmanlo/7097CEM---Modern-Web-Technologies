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

            data.tables.forEach(table => {

                console.log(table.state)
                if (table.state === 'ORDERING') {
                    const tableElement = createOrderElement(table);
                    readyOrderElement.appendChild(tableElement);
                } else if (table.state ===  'WAITING_FOR_FOOD'){
                    // const tableElement = createWaitingTableElement(table);
                    // watingOrderElement.appendChild(tableElement);
                } else if (table.state ===  'DELIVERED'){
                    // const tableElement = createDeliveredTableElement(table);
                    // deliveredOrderElement.appendChild(tableElement);
                }

            });
        })
        .catch(error => console.error('Error fetching tables:', error));
}

function createOrderElement(table){

    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table');
    
    const tableNumber = document.createElement('span');
    tableNumber.classList.add('table-number');
    tableNumber.textContent = `Table ${table.number}`;

    tableDiv.appendChild(tableNumber);
    
    tableDiv.addEventListener('click', function() {
        
        const tableContainerElement = document.getElementById('tableContainer');
        const orderFoodElement = document.getElementById('orderFood');

        tableContainerElement.style.display = 'none';
        orderFoodElement.style.display = 'flex';
    });

    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {

        const tableContainerElement = document.getElementById('tableContainer');
        const orderFoodElement = document.getElementById('orderFood');

        tableContainerElement.style.display = 'flex';
        orderFoodElement.style.display = 'none';
    });

    
    return tableDiv;
}