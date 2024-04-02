

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

document.addEventListener('DOMContentLoaded', function() {
   
    start();
    
})

function start(){
    const staffLink = document.getElementById('staff-link');
    const tableLink = document.getElementById('table-link');
    const menuLink = document.getElementById('menu-link');

    const StaffContainer = document.getElementById('staff-container');
    const tableContainer = document.getElementById('table-container');
    const menuContainer = document.getElementById('menu-container');

    StaffContainer.innerHTML = '';
    tableContainer.innerHTML = '';
    menuContainer.innerHTML = '';

    createStaffCard();

    staffLink.addEventListener('click', function() {
        StaffContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        menuContainer.innerHTML = '';
        createStaffCard(); 
    });

    tableLink.addEventListener('click', function(){
        StaffContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        menuContainer.innerHTML = '';
        createTableCard(); 
    })

    menuLink.addEventListener('click', function(){
        StaffContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        menuContainer.innerHTML = '';
        createFoodCard(); 
    })
}

function createFoodCard(){

    fetch('https://orderingsystem.azurewebsites.net/api/food/getAll')
    .then(response => {
        if(response.status == 200){
            response.json().then(data => {
                data.foods.forEach(food =>{

                    const foodCard = document.createElement('div');
                    foodCard.classList.add('food-card');

                    const foodName = document.createElement('span');
                    foodName.classList.add('food-span');
                    foodName.textContent = `${food.name}`;
                    foodCard.appendChild(foodName);

                    const foodCategory = document.createElement('span');
                    foodCategory.classList.add('food-span');
                    foodCategory.textContent = `${food.category}`;
                    foodCard.appendChild(foodCategory);

                    if (food.ingredients != null) {
                        const ingredientsList = document.createElement('ul'); 
                        for (const key in food.ingredients) {
                            if (food.ingredients.hasOwnProperty(key)) {
                                const ingredient = food.ingredients[key];
                                const ingredientItem = document.createElement('li');
                                ingredientItem.textContent = ingredient;
                                ingredientsList.appendChild(ingredientItem);
                            }
                        }
                        foodCard.appendChild(ingredientsList); 
                    }

                    const buttonDiv = document.createElement('div');
                    buttonDiv.classList.add('button-div');
                    foodCard.appendChild(buttonDiv);

                    const deleteFoodButton = document.createElement('button');
                    deleteFoodButton.textContent='Delete';
                    deleteFoodButton.classList.add('food-delete-button');
                    buttonDiv.appendChild(deleteFoodButton);

                    deleteFoodButton.addEventListener('click', function(){
                        fetch(`https://orderingsystem.azurewebsites.net/api/food/delete?foodId=${food._id}`,{
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(respond =>{
                            if(respond.status == 200){
                                const messageElement = document.createElement('p');
                                messageElement.textContent = "Table Deleted Successfully!";
                                const messageContainer = document.getElementById('messageContainer');
                                messageContainer.innerHTML='';
                                messageContainer.appendChild(messageElement);
                                messageContainer.style.display='flex';
                                const menuContainer = document.getElementById('menu-container');
                                menuContainer.innerHTML = '';
                                createTableCard();
                            }
                            else{
                                throw new Error(`Delete Food API status code: ${respond.status}`);
                            }
                        })
                    })

                    const updateFoodButton = document.createElement('button');
                    updateFoodButton.textContent='Update';
                    updateFoodButton.classList.add('food-update-button');
                    buttonDiv.appendChild(updateFoodButton);

                    updateFoodButton.addEventListener('click', function(){

                        const inputContainer = document.createElement('div');
                        inputContainer.classList.add('input-container');

                        const foodNameUpdate = document.createElement('span');
                        foodNameUpdate.classList.add('food-span');
                        foodNameUpdate.textContent = `${food.name}`;
                        inputContainer.appendChild(foodNameUpdate);

                        const categoryContainer = document.createElement('div');
                        categoryContainer.classList.add('category-container');
                        inputContainer.appendChild(categoryContainer);

                        // Create checkbox inputs for food categories
                        const categories = ['BEVERAGE', 'FOOD', 'DESSERT', 'APPTIZER'];
                        const checkboxes = [];

                        categories.forEach(category => {
                            const checkboxLabel = document.createElement('label');
                            checkboxLabel.textContent = category;

                            const checkboxInput = document.createElement('input');
                            checkboxInput.setAttribute('type', 'checkbox');
                            checkboxInput.setAttribute('name', 'category');
                            checkboxInput.setAttribute('value', category);

                            // Add event listener to uncheck other checkboxes when this one is checked
                            checkboxInput.addEventListener('change', () => {
                                checkboxes.forEach(checkbox => {
                                    if (checkbox !== checkboxInput) {
                                        checkbox.checked = false;
                                    }
                                });
                            });

                            checkboxLabel.appendChild(checkboxInput);
                            categoryContainer.appendChild(checkboxLabel);

                            checkboxes.push(checkboxInput);
                        });

                        const IngContainerDiv = document.createElement('div');
                        IngContainerDiv.classList.add('ingredient-container');
                        inputContainer.appendChild(IngContainerDiv);

                        const addIngButton = document.createElement('button');
                        addIngButton.textContent = 'add Ingredient';
                        addIngButton.classList.add('add-ing-button');
                        IngContainerDiv.appendChild(addIngButton)


                        let ingredientIndex = 0;

                        addIngButton.addEventListener('click', () => {
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.placeholder = 'Ingredient';
                            input.classList.add('ingredient-input');
                            input.name = `ingredient${ingredientIndex}`;
                            IngContainerDiv.appendChild(input);
                            
                            ingredientIndex++;
                        });

                        const submitUpdateBtn = document.createElement('button');
                        submitUpdateBtn.textContent = 'Update';
                        submitUpdateBtn.classList.add('food-update-button');
                        inputContainer.appendChild(submitUpdateBtn)

                        submitUpdateBtn.addEventListener('click', function(){

                            const checkedCheckbox = document.querySelector('input[type="checkbox"]:checked');
                            
                            let updatedfood ={}

                            if (ingredientIndex != 0 && checkedCheckbox !== null){

                                const ingredientInputs = document.querySelectorAll('.ingredient-input');
                                const ingredientsObject = {};
                                ingredientInputs.forEach((input, index) => {
                                    ingredientsObject[index] = input.value.trim();
                                });
                                updatedfood ={
                                    foodId: food._id,
                                    category: checkedCheckbox.value,
                                    ingredients: ingredientsObject,
                                }
                            }
                            else if (ingredientIndex == 0 && checkedCheckbox !== null){
                                updatedfood = {
                                    foodId: food._id,
                                    category: checkedCheckbox.value,
                                }
                            }
                            else if (ingredientIndex != 0 && checkedCheckbox == null){
                                const ingredientInputs = document.querySelectorAll('.ingredient-input');
                                const ingredientsObject = {};
                                ingredientInputs.forEach((input, index) => {
                                    ingredientsObject[index] = input.value.trim();
                                });
                                updatedfood ={
                                    foodId: food._id,
                                    ingredients: ingredientsObject,
                                }
                            }
                            fetch(`https://orderingsystem.azurewebsites.net/api/food/update`,{
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(updatedfood)
                            })
                            .then(ans =>{
                                if (ans.status == 200){
                                    const messageElement = document.createElement('p');
                                    messageElement.textContent = "Food Updated Successfully!";
                                    const messageContainer = document.getElementById('messageContainer');
                                    messageContainer.innerHTML='';
                                    messageContainer.appendChild(messageElement);
                                    messageContainer.style.display='flex';
                                    const menuContainer = document.getElementById('menu-container');
                                    menuContainer.innerHTML = '';
                                    createFoodCard();
                                }
                                else{
                                    throw new Error(`Update food API status code: ${ans.status}`);
                                }

                            })
                        })
                        foodCard.innerHTML='';
                        foodCard.appendChild(inputContainer);
                    })
                    foods.appendChild(foodCard);
                    const menuContainer = document.getElementById('menu-container')
                    menuContainer.appendChild(foods);
                })
            })
        }
    })

    const foods = document.createElement('div');
    foods.classList.add('foods');

    const addNewFood = document.createElement('button');
    addNewFood.classList.add('button-food-create');
    addNewFood.textContent='Add New Food';
    foods.appendChild(addNewFood);

    addNewFood.addEventListener('click', function(){

        const foodCard = document.createElement('div');
        foodCard.classList.add('food-card');

        const inputContainer = document.createElement('div');
        inputContainer.classList.add('input-container');
        foodCard.appendChild(inputContainer);

        const foodNameInput = document.createElement('input');
        foodNameInput.classList.add('input');
        foodNameInput.setAttribute('type', 'text');
        foodNameInput.setAttribute('id', 'newfoodName');
        foodNameInput.setAttribute('placeholder', 'Food Name');
        inputContainer.appendChild(foodNameInput);

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
        inputContainer.appendChild(categoryContainer);

        // Create checkbox inputs for food categories
        const categories = ['BEVERAGE', 'FOOD', 'DESSERT', 'APPTIZER'];
        const checkboxes = [];

        categories.forEach(category => {
            const checkboxLabel = document.createElement('label');
            checkboxLabel.textContent = category;

            const checkboxInput = document.createElement('input');
            checkboxInput.setAttribute('type', 'checkbox');
            checkboxInput.setAttribute('name', 'category');
            checkboxInput.setAttribute('value', category);

            // Add event listener to uncheck other checkboxes when this one is checked
            checkboxInput.addEventListener('change', () => {
                checkboxes.forEach(checkbox => {
                    if (checkbox !== checkboxInput) {
                        checkbox.checked = false;
                    }
                });
            });

            checkboxLabel.appendChild(checkboxInput);
            categoryContainer.appendChild(checkboxLabel);

            checkboxes.push(checkboxInput);
        });
        const IngContainerDiv = document.createElement('div');
        IngContainerDiv.classList.add('ingredient-container');
        inputContainer.appendChild(IngContainerDiv);

        const addIngButton = document.createElement('button');
        addIngButton.textContent = 'add Ingredient';
        addIngButton.classList.add('add-ing-button');
        IngContainerDiv.appendChild(addIngButton)


        let ingredientIndex = 0;

        addIngButton.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Ingredient';
            input.classList.add('ingredient-input');
            input.name = `ingredient${ingredientIndex}`;
            IngContainerDiv.appendChild(input);
            
            ingredientIndex++;
        });

        const submitUpdateBtn = document.createElement('button');
        submitUpdateBtn.textContent = 'Create';
        submitUpdateBtn.classList.add('food-create-button');
        inputContainer.appendChild(submitUpdateBtn)

        submitUpdateBtn.addEventListener('click', function(){
            const checkedCheckbox = document.querySelector('input[type="checkbox"]:checked');
            const ingredientInputs = document.querySelectorAll('.ingredient-input');
            const newfoodName = document.getElementById('newfoodName');
            const ingredientsObject = {};
            ingredientInputs.forEach((input, index) => {
                ingredientsObject[index] = input.value.trim();
            });
            if (checkedCheckbox !== null && newfoodName != null){
                updatedFood ={
                    name: newfoodName.value,
                    category: checkedCheckbox.value,
                    ingredients: ingredientsObject,
                }
                fetch('https://orderingsystem.azurewebsites.net/api/food/create',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedFood)
                }).then(response => {
                    if(response.status == 201){
                        const messageElement = document.createElement('p');
                        messageElement.textContent = "Fodd Created Successfully!";
                        const messageContainer = document.getElementById('messageContainer');
                        messageContainer.innerHTML='';
                        messageContainer.appendChild(messageElement);
                        messageContainer.style.display='flex';
                        const menuContainer = document.getElementById('menu-container');
                        menuContainer.innerHTML = '';
                        createFoodCard();
                    }
                    else{
                        throw new Error(`Create Food API status code: ${respond.status}`);
                    }
                }).catch(error => {
                    alert(`Create Food API Error please try again! ${error}`);
                    
                })
            }
            else{
                alert("Please specify the category and food name!");
            }
        })
        foods.appendChild(foodCard);
    })

}

function createTableCard(){

    const tables = document.createElement('div');
    tables.classList.add('tables');

    const addNewTable = document.createElement('button');
    addNewTable.classList.add('button-table-create');
    addNewTable.textContent='Add New Table';
    tables.appendChild(addNewTable);

    addNewTable.addEventListener('click', function(){
        
        const tableCard = document.createElement('div');
        tableCard.classList.add('table-card');

        const inputContainer = document.createElement('div');
        inputContainer.classList.add('input-container');
        tableCard.appendChild(inputContainer)

        // Create label and input for table number
        const numberInput = document.createElement('input');
        numberInput.classList.add('input');
        numberInput.setAttribute('type', 'number');
        numberInput.setAttribute('id', 'newTableNumber');
        numberInput.setAttribute('placeholder', 'Enter new table number');
        
        const capacityInput = document.createElement('input');
        capacityInput.classList.add('input');
        capacityInput.setAttribute('type', 'number');
        capacityInput.setAttribute('id', 'newTableCapacity');
        capacityInput.setAttribute('placeholder', 'Enter new table capacity');

        const submitUpdate = document.createElement('button');
        submitUpdate.textContent='Create';
        submitUpdate.classList.add('table-create-button');

        submitUpdate.addEventListener('click', function(){
            const capacityIn = document.getElementById('newTableCapacity').value;
            const tableNum = document.getElementById('newTableNumber').value;
            if(capacityIn != null && tableNum != null){
                fetch(`https://orderingsystem.azurewebsites.net/api/table/create?number=${tableNum}&capacity=${capacityIn}`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then( ans=> {
                    if (ans.status == 201){
                        const messageElement = document.createElement('p');
                        messageElement.textContent = "Table Created Successfully!";
                        const messageContainer = document.getElementById('messageContainer');
                        messageContainer.innerHTML='';
                        messageContainer.appendChild(messageElement);
                        messageContainer.style.display='flex';
                        const tableContainer = document.getElementById('table-container');
                        tableContainer.innerHTML = '';
                        createTableCard();
                    }
                    else if (ans.status == 409){
                        alert("Table number should be unique!");
                    }
                    else{
                        throw new Error(`Error in create table API statuse code: ${ans.status}`);
                    }
                }).catch(error =>{
                    console.log(`Error in create table api ${error}`)
                })
            }
            else{
                alert("Please Specify Capacity and table number!")
            }
            
        })

        inputContainer.appendChild(numberInput);
        inputContainer.appendChild(capacityInput);
        inputContainer.appendChild(submitUpdate);

        tables.appendChild(tableCard);


    })

    fetch('https://orderingsystem.azurewebsites.net/api/table/getAll') 
    .then(response => {
        if (response.status == 200){
            
            response.json().then(data => {
                data.tables.forEach(table =>{

                    const tableCard = document.createElement('div');
                    tableCard.classList.add('table-card');

                    const tableNum = document.createElement('span');
                    tableNum.classList.add('table-span');
                    tableNum.textContent = `Table Number: ${table.number}`;
                    tableCard.appendChild(tableNum);

                    const tableCap = document.createElement('span');
                    tableCap.classList.add('table-span');
                    tableCap.textContent = `Capacity: ${table.capacity}`;
                    tableCard.appendChild(tableCap);

                    const buttonDiv = document.createElement('div');
                    buttonDiv.classList.add('button-div');

                    const deleteTableButton = document.createElement('button');
                    deleteTableButton.textContent='Delete';
                    deleteTableButton.classList.add('table-delete-button');
                    buttonDiv.appendChild(deleteTableButton);

                    deleteTableButton.addEventListener('click', function(){
                        fetch(`https://orderingsystem.azurewebsites.net/api/table/delete?number=${table.number}`,{
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(respond =>{
                            if(respond.status == 200){
                                const messageElement = document.createElement('p');
                                messageElement.textContent = "Table Deleted Successfully!";
                                const messageContainer = document.getElementById('messageContainer');
                                messageContainer.innerHTML='';
                                messageContainer.appendChild(messageElement);
                                messageContainer.style.display='flex';
                                const tableContainer = document.getElementById('table-container');
                                tableContainer.innerHTML = '';
                                createTableCard();
                            }
                            else{
                                throw new Error(`Dete Table API status code: ${respond.status}`);
                            }
                        })
                    })

                    const updateTableButton = document.createElement('button');
                    updateTableButton.textContent='Update';
                    updateTableButton.classList.add('table-update-button');
                    buttonDiv.appendChild(updateTableButton);

                    updateTableButton.addEventListener('click', function(){

                        const inputContainer = document.createElement('div');
                        inputContainer.classList.add('input-container');

                        // Create label and input for table number
                        const numberInput = document.createElement('input');
                        numberInput.classList.add('input');
                        numberInput.setAttribute('type', 'number');
                        numberInput.setAttribute('id', 'newTableNumber');
                        numberInput.setAttribute('placeholder', 'Enter new table number');
                        
                        const capacityInput = document.createElement('input');
                        capacityInput.classList.add('input');
                        capacityInput.setAttribute('type', 'number');
                        capacityInput.setAttribute('id', 'newTableCapacity');
                        capacityInput.setAttribute('placeholder', 'Enter new table capacity');

                        const submitUpdate = document.createElement('button');
                        submitUpdate.textContent='Update';
                        submitUpdate.classList.add('table-update-button');

                        submitUpdate.addEventListener('click', function(){
                            const newTableNumber = document.getElementById('newTableNumber').value;
                            const newTableCapacity = document.getElementById('newTableCapacity').value;
                            fetch(`https://orderingsystem.azurewebsites.net/api/table/update`,{
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({number:table.number, new_number: newTableNumber, capacity: newTableCapacity})
                            }).then(ans => {
                                if (ans.status == 200){
                                    const messageElement = document.createElement('p');
                                    messageElement.textContent = "Table Updated Successfully!";
                                    const messageContainer = document.getElementById('messageContainer');
                                    messageContainer.innerHTML='';
                                    messageContainer.appendChild(messageElement);
                                    messageContainer.style.display='flex';
                                    const tableContainer = document.getElementById('table-container');
                                    tableContainer.innerHTML = '';
                                    createTableCard();
                                }  
                                else if(ans.status == 409){
                                    alert("The new table number already exists!");
                                }
                                else{
                                    throw new Error(`Update Table API status code: ${respond.status}`);
                                } 
                            })
                            
                        })
                    
                        // Append inputs and labels to the container
                        inputContainer.appendChild(numberInput);
                        inputContainer.appendChild(capacityInput);
                        inputContainer.appendChild(submitUpdate);
                        
                        tableCard.innerHTML='';
                        tableCard.append(inputContainer);

                    });

                    tableCard.appendChild(buttonDiv);
                    tables.appendChild(tableCard);
                })
            })
            const tableContainer = document.getElementById('table-container');
            tableContainer.appendChild(tables);
        }
        else{
            throw new Error(`Get Table API status code: ${respond.status}`);
        }

    }).catch(error => {
        alert('Table Error please try again!');
        
    })


}

function createStaffCard(){
    
    fetch('https://orderingsystem.azurewebsites.net/api/admin/users') 
    .then(response => {
        
        if (response.status == 200){
            const users = document.createElement('div');
            users.classList.add('users');
            response.json().then(data => {
                data.found_users.forEach(user =>{

                    const userCard = document.createElement('div');
                    userCard.classList.add('user-card');

                    const userName = document.createElement('span');
                    userName.classList.add('user-span');
                    userName.textContent = `${user.name}`;
                    userCard.appendChild(userName);

                    const userEmail = document.createElement('span');
                    userEmail.classList.add('user-span');
                    userEmail.textContent = `${user.email}`;
                    userCard.appendChild(userEmail);                    

                    if (user.role === null){

                        const rolesSelectorDiv = document.createElement('div');
                        rolesSelectorDiv.classList.add('roles-selector');
                        rolesSelectorDiv.id = 'roles-selector';

                        const label = document.createElement('label');
                        label.setAttribute('for', 'roles');
                        label.textContent = 'Choose a role:';

                        const select = document.createElement('select');
                        select.classList.add('roles');
                        select.id = 'roles';

                        const roles = ['Admin', 'Server', 'Kitchen', 'Welcome'];
                        roles.forEach(role => {
                            const option = document.createElement('option');
                            option.value = role.toUpperCase();
                            option.textContent = role;
                            select.appendChild(option);
                        });

                        rolesSelectorDiv.appendChild(label);
                        rolesSelectorDiv.appendChild(select);

                        userCard.appendChild(rolesSelectorDiv);

                        const acceptButton = document.createElement('button');
                        acceptButton.textContent='Accept';
                        acceptButton.classList.add('user-accept-button');
                        userCard.appendChild(acceptButton);

                        acceptButton.addEventListener('click', function(){
                            const roleIn = document.getElementById('roles');
                            fetch(`https://orderingsystem.azurewebsites.net/api/admin/changeRole`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({email:user.email, role: roleIn.value})
                            }) 
                            .then(respond => {
                                if (respond.status == 200){
                                    const messageElement = document.createElement('p');
                                    messageElement.textContent = "User Accepted!";
                                    const messageContainer = document.getElementById('messageContainer');
                                    messageContainer.innerHTML='';
                                    messageContainer.appendChild(messageElement);
                                    messageContainer.style.display='flex';
                                    start();
                                }
                            })
                        })

                    }
                    else{

                        const userRole = document.createElement('span');
                        userRole.classList.add('user-span');
                        userRole.textContent = `${user.role}`;
                        
                        userCard.appendChild(userRole);

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent='Delete';
                        deleteButton.classList.add('user-delete-button');

                        userCard.appendChild(deleteButton);

                        deleteButton.addEventListener('click', function(){
                            fetch(`https://orderingsystem.azurewebsites.net/api/admin/delete?email=${user.email}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }) 
                            .then(respond => {
                                if (respond.status == 200){
                                    const messageElement = document.createElement('p');
                                    messageElement.textContent = "Deleted Successfully!";
                                    const messageContainer = document.getElementById('messageContainer');
                                    messageContainer.innerHTML='';
                                    messageContainer.appendChild(messageElement);
                                    messageContainer.style.display='flex';
                                }
                                else{
                                    throw new Error(`Delete user API status code: ${respond.status}`); 
                                }
                            })
                        });
                    }

                    users.appendChild(userCard);
                })
            })
            const StaffContainer = document.getElementById('staff-container');
            StaffContainer.appendChild(users);
        }
        else{
            throw new Error(`Get user API status code: ${respond.status}`);
        }
    })
    .catch(error => {
        console.error('Error fetching staff data:', error);
    });
    
}