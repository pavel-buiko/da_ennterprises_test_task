import type { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/file-service.js';
import { ApiError } from '../exceptions/api-error.js';
import path from 'path/win32';

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

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.id) {
        return ApiError.BadRequest('Id не указан');
      }

      const data = await fileService.getById(req.params.id);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'Id не указан' });

      await fileService.deleteFile(id);

      return res.status(200).json({ message: 'Файл удалён' });
    } catch (error) {
      next(error);
    }
  };

  download = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (!id) return next(ApiError.BadRequest('Id не указан'));

      const record = await fileService.getById(id);
      if (!record) return next(ApiError.BadRequest(`Файл с id ${id} не найден`));

      const absolutePath = path.join(process.cwd(), record.path);

      return res.download(absolutePath, record.originalName, (err) => {
        if (err) return next(err);
      });
    } catch (error) {
      next(error);
    }
  };
}

export const fileController = new FileController();
