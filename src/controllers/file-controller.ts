import type { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/file-service.js';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

class FileController {
  upload = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Файл для загрузки не обнаружен' });
      }

      const record = await fileService.createFileRecord(file);

      return res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const listSize = req.query.list_size ? parseInt(req.query.list_size as string, 10) : 10;

      const data = await fileService.listFiles({ page, listSize });

      return res.json(data);
    } catch (error) {
      next(error);
    }
  };
}

export const fileController = new FileController();
