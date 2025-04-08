async function registerSupplier() {
    const company = document.getElementById('company').value;
    const phone = document.getElementById('phone').value;
    const representative = document.getElementById('representative').value;

    const requestData = {
        Company: company,
        PhoneNumber: phone,
        RepresentativeName: representative
    };

    try {
        const response = await fetch('/Suppliers/AddSupplier', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            alert('ההרשמה בוצעה בהצלחה!');
            window.location.href = 'supplier-requests.html'; 
        } else if (response.status === 409) {
            const errorData = await response.json();
            
            const userWantsToLogin = confirm(`${errorData.message}. האם ברצונך לעבור לעמוד הכניסה?`);
            if (userWantsToLogin) {
                window.location.href = 'supplier-login.html';
            }
        } else {
            alert('שגיאה בהרשמה. נסה שוב מאוחר יותר.');
        }
    } catch (error) {
        console.error('שגיאה בשירות:', error);
        alert('שגיאה בשירות. נסה שוב מאוחר יותר.');
    }
}
