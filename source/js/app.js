const startButton = document.getElementById('start-button');

startButton.addEventListener('click', () => {
    const startPage = document.getElementById('start-page')
    const examPage = document.getElementById('exam-page')
    
    examPage.classList.remove('ocultar')
    startPage.classList.add('ocultar')
    startPage.classList.remove('mostrar')
    examPage.classList.add('mostrar')
});