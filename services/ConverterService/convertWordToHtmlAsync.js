import { spawn } from "child_process";
export async function convertWordToHtmlAsync(wordName, outdir, args = []) {
    return new Promise((resolve, reject) => {
        const commandPrompt = ['--headless', '--convert-to', 'html:HTML:EmbedImages', wordName, '--outdir', outdir, ...args];
        let libreoffice = spawn("libreoffice", commandPrompt);
        libreoffice.stdout.on("data", (data) => {
            console.log('stdout:', data.toString());
        });
        libreoffice.on("error", (err) => {
            console.error('Error:', err);
            reject(new Error('Error converting file'));
        });
        libreoffice.on("exit", (code, signal) => {
            if (code !== 0) {
                console.error('Ошибка конвертации:', code, signal);
                reject(new Error('Ошибка конвертации файла'));
            }
            else {
                console.log('Конвертация завершена успешно');
                resolve();
            }
        });
    });
}
