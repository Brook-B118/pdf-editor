

document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function () {
        const fileName = this.getAttribute('data-file-filename');
        fetch(`/remove/${fileName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken // Include CSRF token if needed
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(`file-${fileName}`).remove();
                } else {
                    alert('Error removing file');
                }
            });
    });
});