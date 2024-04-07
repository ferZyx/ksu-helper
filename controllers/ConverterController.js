// import ConverterService from "../services/ConverterService.js";
import {convertWordToHtmlAsync} from "../services/ConverterService/convertWordToHtmlAsync.js";
import fs from "fs";
import multer from "multer";
import * as uuid from "uuid";
import queue from 'async/queue.js';


const q = queue(async (taskData) => {
    const callback = taskData.callback;
    const file = taskData.file;
    try {
        await convertWordToHtmlAsync(file.path, 'uploads/converted/');
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
        const allowedExtensions = ['.doc', '.docx']; // Разрешенные расширения файлов
        const fileExtension = '.' + req.file.originalname.split('.').pop();
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({error: 'Недопустимый формат файла'});
        }

        q.push({
            file: req.file, callback: (err, result) => {
                if (err) {
                    return res.status(500).json({error: 'Ошибка конвертации файла'});
                }
                fs.rmSync(req.file.path); // Удаляем исходный файл
                res.sendFile(req.file.path.replace('uploads', 'uploads/converted').replace(fileExtension, '.html'));
            }
        });


    } catch (e) {
        next(e)
    }
}
