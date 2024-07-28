
if (document.getElementById('uploadDocumentsForm')) {

    let form = document.getElementById('uploadDocumentsForm')

    document.getElementById('document').addEventListener('change', function () {
        form.submit();
    })
}

