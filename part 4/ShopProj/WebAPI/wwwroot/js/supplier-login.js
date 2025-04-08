
async function loginSupplier() {
    const company = document.getElementById('company').value;
    const phone = document.getElementById('phone').value;
    localStorage.setItem("supplierCompany", company);

    const baseUrl = `${window.location.origin}/Suppliers`;
    const formData = new FormData();
    formData.append('company', company);
    formData.append('phone', phone);

    try {
        const response = await fetch(`${baseUrl}/LoginSupplier`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // התחברות הצליחה
            window.location.href = 'supplier-requests.html';
        } else if (response.status === 403) {
            // החברה קיימת אבל מספר הטלפון שגוי
            alert('מספר הטלפון שגוי');
        } else if (response.status === 401) {
            // החברה לא קיימת במערכת
            window.location.href = 'supplier-register.html';
        } else {
            alert('שגיאה בכניסה. נסה שוב מאוחר יותר.');
        }
    } catch (error) {
        console.error('שגיאה בשירות:', error);
        alert('שגיאה בשירות. נסה שוב מאוחר יותר.');
    }
}