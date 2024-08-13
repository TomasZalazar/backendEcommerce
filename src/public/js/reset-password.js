document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const token = document.querySelector('input[name="token"]').value;
        const newPassword = document.getElementById('newPassword').value;
        
        const response = await fetch('/api/recover/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });

        const messageElement = document.getElementById('message');
        if (response.ok) {
            const result = await response.json();
            messageElement.textContent = result.message;
            setTimeout(() => {
                window.location.href = result.redirectUrl; 
            }, 2000);
        } else {
            const error = await response.text();
            messageElement.textContent = error;
        }
    });
});