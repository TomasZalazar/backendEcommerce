document.addEventListener('DOMContentLoaded', function(){

    document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const response = await fetch('/api/recover/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const messageElement = document.getElementById('message');
        if (response.ok) {
            messageElement.textContent = 'Check your email for the reset link.';
        } else {
            const error = await response.text();
            messageElement.textContent = error;
        }
    });
    
});