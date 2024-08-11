// import * as pdfjsLib from '/static/js/build/pdf.mjs';
import * as pdfjsLib from 'https://unpkg.com/pdfjs-dist@4.5.136/build/pdf.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.mjs';

export let pages = 0;

export const displayPDF = function (url) {
    return new Promise((resolve, reject) => {
        var loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function (pdf) {
            console.log("pdf is loaded")
            window.pdfDoc = pdf; // This is for pdf.js
            var displayDiv = document.getElementById('pdf-display');
            console.log("found pdf-display")
            // displayDiv.innerHTML = ''; // Clear previous content
            pages = pdf.numPages;

            for (let i = 1; i <= pages; i++) {
                pdf.getPage(i).then(function (page) {
                    console.log("pdf page line passed")
                    let viewport = page.getViewport({ scale: 1 });
                    var outputScale = window.devicePixelRatio || 1; // This line was not being used and the pdf was only being a quarter of the way loaded
                    let canvas = document.createElement('canvas');
                    canvas.width = Math.floor(viewport.width * outputScale);
                    canvas.height = Math.floor(viewport.height * outputScale);
                    let context = canvas.getContext('2d');
                    context.scale(outputScale, outputScale);

                    page.render({ canvasContext: context, viewport: viewport });
                    displayDiv.appendChild(canvas);

                    let overlay = document.createElement('div');
                    overlay.style.width = `${canvas.width}px`;
                    overlay.style.height = `${canvas.height}px`;
                    overlay.style.position = 'absolute';
                    overlay.style.top = `${canvas.offsetTop}px`;
                    overlay.style.left = `${canvas.offsetLeft}px`;
                    overlay.classList.add('overlay');
                    overlay.id = `overlay-${i}`;
                    displayDiv.appendChild(overlay);

                    if (i === pages) resolve(); // Resolve when the last page is rendered
                });
            }
        }).catch(reject);
    });
};



// The offsetTop and offsetLeft properties give the distance between the element and its offset parent, not the browser's edge. The offset parent is usually the nearest positioned ancestor. In this case, it should be the pdf-display div.

// Along with asking the duck questions and reading the documentation at: https://mozilla.github.io/pdf.js/examples/ 
// I watched this video to get better with JavaScript: https://youtu.be/EerdGm-ehJQ?si=mySJXTTRq74mehVs
















// export const displayPDF = function (url) {
//     return new Promise((resolve, reject) => {
//         var loadingTask = pdfjsLib.getDocument(url);
//         var displayDiv = document.getElementById('pdf-display');
//         displayDiv.innerHTML = ''; // Clear previous content
//         loadingTask.promise.then(function (pdf) {
//             console.log('PDF loaded');
//             // You can now use *pdf* here
//             let pages = pdf.numPages;
//             for (let i = 1; i <= pages; i++) {
//                 pdf.getPage(i).then(function (page) {
//                     let viewport = page.getViewport({ scale: 1 });
//                     var outputScale = window.devicePixelRatio || 1; // This line was not being used and the pdf was only being a quarter of the way loaded
//                     let canvas = document.createElement('canvas')

//                     // Add these lines to fully create the canvas
//                     canvas.width = Math.floor(viewport.width * outputScale);
//                     canvas.height = Math.floor(viewport.height * outputScale);
//                     let context = canvas.getContext('2d');
//                     context.scale(outputScale, outputScale);

//                     page.render({ canvasContext: context, viewport: viewport });
//                     displayDiv.appendChild(canvas);
//                     if (i === pages) resolve(); // Resolve when the last page is rendered
//                 });
//             }
//         }).catch(reject);
//     });
// };

















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



