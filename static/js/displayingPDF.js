import * as pdfjsLib from '/static/js/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/js/build/pdf.worker.mjs';
console.log(url)
document.addEventListener('DOMContentLoaded', function () {
    console.log(url)
    var loadingTask = pdfjsLib.getDocument(url);
    console.log(url)
    var displayDiv = document.getElementById('pdf-display');
    loadingTask.promise.then(function (pdf) {
        console.log('PDF loaded');
        // You can now use *pdf* here
        let pages = pdf.numPages;
        for (let i = 1; i == pages; i++) {
            pdf.getPage(i).then(function (page) {
                let viewport = page.getViewport({ scale: 1 });
                var outputScale = window.devicePixelRatio || 1;
                let canvas = document.createElement('canvas')
                let context = canvas.getContext('2d');

                page.render({ canvasContext: context, viewport: viewport });
                displayDiv.appendChild(canvas);
            })
        };
    });
});


















// First attempt was using fetch to get the filename from the route
// Remember anything inside the fetch is scoped and so you need to do everything within this fetch

// fetch('/doc_name/' + docId)
//     .then(response => response.json())
//     .then(data => {
//         // 'data' is the JSON object that the server responded with.
//         // You can access the filename with 'data.filename'.
//         let filename = data.filename;
//         var loadingTask = pdfjsLib.getDocument('../../uploaded_files/' + filename); // Had to put the '..' because uploaded_files is outside of this directory, in another directory.
//         loadingTask.promise.then(function (pdf) {
//             console.log('PDF loaded');
//             // You can now use *pdf* here
//             let pages = pdf.numPages;
//             for (let i = 0; i < pages; i++) {
//                 pdf.getPage(i).then(function (page) { // the goal here is to create a canvas for each page, give it context and size and then render the page and append it.
//                     let canvas = document.createElement('canvas') // canvas is indeed an html tag
//                     let context = canvas.getContext('2d');
//                     let viewport = page.getViewport({ scale: 1 });
//                     page.render({ canvasContext: context, viewport: viewport });
//                     document.body.appendChild(canvas);
//                 })
//             };

//             // When done using the info to display the code
//             window.location.href = '/documents/edit/' + docId;
//         });
//     });



