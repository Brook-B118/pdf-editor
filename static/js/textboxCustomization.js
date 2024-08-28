
export function addTextboxEventListeners(textboxContainerId) {
    const container = document.getElementById(textboxContainerId);
    const textbox = container.querySelector('textarea');

    // Customize textbox inside the container that was passed through

    document.getElementById('align-left').addEventListener('click', function () {
        textbox.style.textAlign = 'left';
    });

    document.getElementById('align-center').addEventListener('click', function () {
        textbox.style.textAlign = 'center';
    });

    document.getElementById('align-right').addEventListener('click', function () {
        textbox.style.textAlign = 'right';
    });

    document.getElementById('bg-color-picker').addEventListener('input', function (event) {
        textbox.style.backgroundColor = event.target.value;
    });

    document.getElementById('font-selector').addEventListener('change', function (event) {
        textbox.style.fontFamily = event.target.value;
    });

    document.getElementById('delete-element').addEventListener('click', function () {
        fetch('/remove_element', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken // Includes CSRF token
            },
            body: JSON.stringify({
                document_id: documentId,
                element_id: textboxContainerId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(textboxContainerId).remove();
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

// Export the function if using modules
// export { addTextboxEventListeners };