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

        console.log("סטטוס התגובה:", response.status); 

        if (response.ok) {
            
            window.location.href = 'supplier-requests.html';
        } else if (response.status === 401) {
            window.location.href = 'supplier-register.html';
        //} else if (response.status === 403 || response.status === 400 || response.status === 404) {
        //    alert('מספר הטלפון שגוי');
        //} else {
        //    alert('שגיאה בשירות. נסה שוב מאוחר יותר.');
        //}
    } catch (error) {
        console.error('שגיאה בשירות:', error);
        alert('שגיאה בשירות. נסה שוב מאוחר יותר.');
    }
}