document.getElementById('signInButton').addEventListener('click', function() {
    
    // Get the data values from input fields
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repassword = document.getElementById('repassword').value;

    if (name == undefined || email == undefined || password == undefined || repassword == undefined )
        return;
        if (name == "" || email == "" || password == "" || repassword == "" )
        return;

    if (password !== repassword) {
        document.getElementById('passwordError').style.display = 'block';
        event.preventDefault(); 
        return;
    }
    
    // Construct the data to be sent in the request body
    const data = {
        name: name,
        email: email,
        password: password
    };

    console.log(data)

    // Make an AJAX request to the sign-in API
    fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status == 200) {
            document.getElementById('notification').style.display = 'block';
            document.getElementById('account').style.display = 'block';
            document.getElementById('emailError').style.display = 'none';
            document.getElementById('passwordError').style.display = 'none';
            document.getElementById('inputError').style.display = 'none';
        }
        else if (response.status == 409){
            document.getElementById('emailError').style.display = 'block';
            document.getElementById('notification').style.display = 'none';
            document.getElementById('passwordError').style.display = 'none';
            document.getElementById('account').style.display = 'none';
        }  
        else if (response.status == 400 || response.status == 404){
            document.getElementById('notification').style.display = 'none';
            document.getElementById('emailError').style.display = 'none';
            document.getElementById('account').style.display = 'block';
            document.getElementById('inputError').style.display = 'block';
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
    
    event.preventDefault(); 
});