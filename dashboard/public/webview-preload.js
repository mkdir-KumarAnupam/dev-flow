const { ipcRenderer } = require('electron');

let solvedDetected = false;

window.extractEditorCode = function() {
    try {
        if (window.monaco && window.monaco.editor) {
            const models = window.monaco.editor.getModels();
            if (models.length > 0) {
                return models[0].getValue();
            }
        }
    } catch(e) {}
    
    try {
        const lines = document.querySelectorAll('.view-lines .view-line');
        if (lines.length > 0) {
            let code = Array.from(lines).map(line => line.textContent).join('\n');
            return code.replace(/\u00a0/g, ' ');
        }
    } catch(e) {}

    return "";
};

const observer = new MutationObserver((mutations) => {
    if (solvedDetected) return;
    
    // Look for LeetCode's Accepted text
    const resultElement = document.querySelector('[data-e2e-locator="submission-result"]') || document.querySelector('.text-green-s');
    if (resultElement) {
        if (resultElement.textContent.includes('Accepted')) {
            solvedDetected = true;
            ipcRenderer.sendToHost('problem-solved', { status: 'solved' });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});
