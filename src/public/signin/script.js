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
    fetch('http://localhost:3000/auth/signup ', {
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
                    
                elseif (res.role === 'WELCOME')

                elseif (res.role === 'SERVER')
                location.href
            })
        } else {
            console.error('Sign-in failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});