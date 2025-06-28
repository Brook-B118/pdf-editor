// Used this so that user doesn't have to click 'submit' after picking a file. The file is automatically submitted upon clicking a file. This way we only need to show the one button.

if (document.getElementById('uploadDocumentsForm')) {

    let form = document.getElementById('uploadDocumentsForm')

    document.getElementById('document').addEventListener('change', function () {
        form.submit();
    })
}

