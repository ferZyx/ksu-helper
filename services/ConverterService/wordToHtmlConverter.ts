import {ChildProcessWithoutNullStreams, spawn} from "child_process";

/*
* wordToHtmlByLibreOffice
* @param wordName - путь к файлу word
* @param outdir - путь к директории, куда сохранить html
* @param args - дополнительные аргументы для libreoffice
* @returns Promise<void>
* */
export async function wordToHtmlByLibreOffice(wordName: string, outdir: string, args: string[] = []): Promise<void> {
    return new Promise<void>((resolve, reject): void => {
        const commandPrompt: string[] = ['--headless', '--convert-to', 'html:HTML:EmbedImages', wordName, '--outdir', outdir, ...args];
        let libreoffice: ChildProcessWithoutNullStreams = spawn("libreoffice", commandPrompt);

        libreoffice.stdout.on("data", (data: Buffer) => {
            console.log('stdout:', data.toString());
        });

        libreoffice.on("error", (err) => {
            console.error(`Ошибка конвертации файла ${wordName}. ` + err.stack);
            reject(err);
        });

        libreoffice.on("exit", (code, signal) => {
            if (code !== 0) {
                console.error(`Ошибка конвертации файла ${wordName}. Код: ${code} ${signal}`);
                reject(new Error('Ошибка конвертации файла. Код: ' + code + ' ' + signal));
            } else {
                console.log(`Конвертация файла ${wordName} завершена успешно`)
                resolve();
            }
        });
    });
}

/*
* wordToHtmlByPandoc
* @param wordName - путь к файлу word
* @param htmlName - путь к файлу html
* @param args - дополнительные аргументы для pandoc
* @returns Promise<void>
* */
export async function wordToHtmlByPandoc(wordName: string, htmlName: string, args: string[] = []): Promise<void> {
    return new Promise<void>((resolve, reject): void => {
        const commandPrompt: string[] = [wordName, '-o', htmlName, '--self-contained', ...args];
        let pandoc: ChildProcessWithoutNullStreams = spawn("pandoc", commandPrompt);

        pandoc.stdout.on("data", (data: Buffer) => {
            console.log('stdout:', data.toString());
        });

        pandoc.on("error", (err) => {
            console.error(`Ошибка конвертации файла ${wordName}. ` + err.stack);
            reject(err);
        });

        pandoc.on("exit", (code, signal) => {
            if (code !== 0) {
                console.error(`Ошибка конвертации файла ${wordName}. Код: ${code} ${signal}`);
                reject(new Error('Ошибка конвертации файла. Код: ' + code + ' ' + signal));
            } else {
                console.log(`Конвертация файла ${wordName} завершена успешно`)
                resolve();
            }
        });
    });
}