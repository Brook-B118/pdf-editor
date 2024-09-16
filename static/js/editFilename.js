document.getElementById('edit-filename').addEventListener('input', function () {
    const newFilename = this.value;
    fetch('/update-filename', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Includes CSRF token
        },
        body: JSON.stringify({
            document_id: documentId,
            filename: newFilename,
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error)
        });
})