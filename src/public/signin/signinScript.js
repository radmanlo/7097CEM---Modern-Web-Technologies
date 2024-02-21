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
    fetch('http://localhost:3000/api/auth/signin ', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status == 200) {
            respond.json().then((res)=>{
                if (res.role === 'ADMIN')
                    location.href = '../admin/admin.html'
                elseif (res.role === 'KITCHEN')
                    location.href = '../kitchen/kitchen.html'
                elseif (res.role === 'WELCOME')
                    location.href = '../welcom'
                elseif (res.role === 'SERVER')
                    location.href = '../server/server.html'
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
            alert("Internal Server Error. Please try again later");  
        }
    })
    .catch(error => {
        alert("Internal Server Error. Please try again later");
        console.error('Error:', error);
    });
    event.preventDefault(); 
});