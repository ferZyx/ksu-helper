import fs from "fs";
import multer from "multer";
import * as uuid from "uuid";
import queue from 'async/queue.js';
import {wordToHtmlByLibreOffice, wordToHtmlByPandoc} from "../services/ConverterService/wordToHtmlConverter.js";


const q = queue(async (taskData) => {
    const callback = taskData.callback;
    const file = taskData.file;
    try {
        await wordToHtmlByLibreOffice(file.path, 'uploads/converted/');
        callback(null, `Успешно сконвертирован.`);
    } catch (error) {
        callback(error, null);
    }
}, 1); // Указываем максимальное количество одновременных операций равным 1


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadFolder = 'uploads/';
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder);
        }
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uuid.v4()}-${uniqueSuffix}-${file.originalname}`);
    }
})

export function fileCheckMiddleware(req, res, next) {
    if (!req.file) {
        return res.status(400).json({error: 'Вы не загрузили файл'});
    }
    next();
}

export const upload = multer({storage: storage})

export async function wordToHtml(req, res, next) {
    try {
        const fileExtension = '.' + req.file.originalname.split('.').pop();

        if (fileExtension === '.doc') {
            convertWithLibreOffice(req, res, fileExtension)
        } else if (fileExtension === '.docx') {
            convertWithPandoc(req, res, fileExtension).catch(e => {
                console.log(e)
                convertWithLibreOffice(req, res, fileExtension)
            })
        } else {
            return res.status(400).json({error: 'Недопустимый формат файла'});
        }


        function convertWithLibreOffice(req, res, fileExtension) {
            q.push({
                file: req.file, callback: (err, result) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({error: 'Ошибка конвертации файла'});
                    }
                    fs.rmSync(req.file.path); // Удаляем исходный файл
                    const htmlPath = req.file.path.replace('uploads', 'uploads/converted').replace(fileExtension, '.html');
                    const htmlAbsolutePath = `${process.cwd()}/${htmlPath}`;

                    res.sendFile(htmlAbsolutePath, (err) => {
                        if (err) {
                            console.error('Ошибка отправки файла:', err);
                            throw new Error('Ошибка отправки файла');
                        } else {
                            fs.rmSync(htmlAbsolutePath);
                        }
                    });
                }
            })
        }

        async function convertWithPandoc(req, res, fileExtension) {
            const htmlPath = req.file.path.replace('uploads', 'uploads/converted').replace(fileExtension, '.html');
            const htmlAbsolutePath = `${process.cwd()}/${htmlPath}`;

            await wordToHtmlByPandoc(req.file.path, htmlAbsolutePath)
                .then(() => {
                    fs.rmSync(req.file.path)
                    res.sendFile(htmlAbsolutePath, (err) => {
                        if (err) {
                            console.error('Ошибка отправки файла:', err);
                            throw new Error('Ошибка отправки файла');
                        } else {
                            fs.rmSync(htmlAbsolutePath);
                        }
                    })
                })
        }
    } catch (e) {
        next(e)
    }
}
