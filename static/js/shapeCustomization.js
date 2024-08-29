
export function addShapeEventListeners(shapeId) {
    const container = document.getElementById(shapeId);

    // Customize shape inside the container that was passed through

    document.getElementById('delete-element').addEventListener('click', function () {
        fetch('/remove_element', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken // Includes CSRF token
            },
            body: JSON.stringify({
                document_id: documentId,
                element_id: shapeId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(shapeId).remove();
                    console.log('Sucess:', data);
                } else {
                    alert('Error removing Textbox container element')
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            });
    })
}