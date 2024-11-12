export function handleWindowControls(electron) {
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');

    minimizeBtn.addEventListener('click', () => {
        electron.minimizeWindow();
    });

    closeBtn.addEventListener('click', () => {
        electron.closeWindow();
    });
}
