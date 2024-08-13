window.addEventListener('scroll', function () {
    const toolbox = document.querySelector('.toolbox');
    toolbox.style.top = `${window.scrollY}px`;
});