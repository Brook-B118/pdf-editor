
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
}

// Export the function if using modules
// export { addTextboxEventListeners };