// document.querySelector('.navbar-toggler').addEventListener('click', function () {
//     document.getElementById('sidebar-container').classList.toggle('expanded');
// });

document.querySelector('.collapsed-sidebar').addEventListener('click', function () {
    document.querySelector('.vertical-column-wrapper').classList.toggle('collapsed')
    document.querySelector('.pdf-container').classList.toggle('extended')
})