document.getElementById('signInButton').addEventListener('click', function() {
    
    // Get the data values from input fields
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repassword = document.getElementById('repassword').value;

    if (password !== repassword) {
        document.getElementById('passwordError').style.display = 'block';
        event.preventDefault(); 
    }
    
    // Construct the data to be sent in the request body
    const data = {
        name: name,
        email: email,
        password: password
    };

    // Make an AJAX request to the sign-in API
    fetch('http://localhost:3000/api/auth/signup ', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status == 200) {
            document.getElementById('notification').style.display = 'block';
        }
        else if (response.status == 400){
            document.getElementById('account').style.display = 'none'
            document.getElementById('emailError').style.display = 'block'
        }   
        else if (response.status == 500){
            alert("Server Error! Please try again later")
        }
        else {
            alert("Invalid input please try again!");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});