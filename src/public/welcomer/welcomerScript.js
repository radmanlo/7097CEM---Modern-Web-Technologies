
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

function createEmptyTableElement(table) {

    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table');

    tableDiv.innerHTML = `
        <span>Table ${table.number}</span>
        <span>Capacity ${table.capacity}</span>
        <button class="occupy-button">Occupy</button>
    `;

    const occupyButton = tableDiv.querySelector('.occupy-button');

    occupyButton.addEventListener('click', function() {
        fetch(`http://localhost:3000/api/table/state?number=${table.number}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {

            if (response.status == 200){

                const emptyTablesElement = document.getElementById('emptyTables');
                const occupiedTablesElement = document.getElementById('occupiedTables');

                emptyTablesElement.innerHTML = '';
                occupiedTablesElement.innerHTML = '';

                start()

            } else {
                throw new Error('Unexpected response');
            }
        })
        .catch(error => {
            alert("An error occurred while processing your request.");
            console.error('Error:', error);
        });
    });

    return tableDiv;
}

function createOccupiedTableElement(table) {
    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table');
    tableDiv.innerHTML = `
        <span>Table ${table.number}</span>
        <span>Capacity ${table.capacity}</span>
        <button class="empty-button">Empty</button>
    `;

    const occupyButton = tableDiv.querySelector('.empty-button');

    occupyButton.addEventListener('click', function() {

        fetch(`http://localhost:3000/api/table/empty?number=${table.number}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status == 200){

                const emptyTablesElement = document.getElementById('emptyTables');
                const occupiedTablesElement = document.getElementById('occupiedTables');

                emptyTablesElement.innerHTML = '';
                occupiedTablesElement.innerHTML = '';

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

    return tableDiv;
}

function start() {
    
    fetch('http://localhost:3000/api/table/getAll')
        .then(response => response.json())
        .then(data => {

            const emptyTablesElement = document.getElementById('emptyTables');
            const occupiedTablesElement = document.getElementById('occupiedTables');


            data.tables.forEach(table => {

                if (table.state === 'EMPTY') {
                    const tableElement = createEmptyTableElement(table);
                    emptyTablesElement.appendChild(tableElement);
                } else {
                    const tableElement = createOccupiedTableElement(table);
                    occupiedTablesElement.appendChild(tableElement);
                }

            });
        })
        .catch(error => console.error('Error fetching tables:', error));
}



