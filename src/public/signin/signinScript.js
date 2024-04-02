document.getElementById('signInButton').addEventListener('click', function() {
    
    // Get the email and password values from input fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Construct the data to be sent in the request body
    const data = {
        email: email,
        password: password
    };

    // Make an AJAX request to the sign-in API
    fetch('https://orderingsystem.azurewebsites.net/api/auth/signin ', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status == 200) {
            response.json().then((res)=>{

                let nextPage;
                
                if (res.role === 'ADMIN')
                    nextPage = '../admin/admin.html';
                else if (res.role === 'KITCHEN')
                    nextPage = '../kitchen/kitchen.html';
                else if (res.role === 'WELCOME')
                    nextPage = '../welcomer/welcomer.html';
                else if (res.role === 'SERVER')
                    nextPage = '../server/server.html';

                location.href = nextPage;
            })
        } 
        else if (response.status == 409) {
            document.getElementById("inputError").style.display = "block";
            document.getElementById("acceptError").style.display = "none";
        } 
        else if (response.status == 400) {
            document.getElementById("acceptError").style.display = "block";
            document.getElementById("inputError").style.display = "none";
        }
        else{
            alert("Internal Server Error. Please try again later" );  
            alert(response.status)
        }
    })
    .catch(error => {
        alert("Internal Server Error. Please try again later");
        console.error('Error:', error);
    });
    event.preventDefault(); 
});