import { Router } from 'express';
import { userController } from '../controllers/user-controller.js';
import { AuthMiddleware } from '../middlewares/auth-middleware.js';
import multer from 'multer';
import { fileController } from '../controllers/file-controller.js';

export const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/logout', userController.signout);

router.post('/signup', userController.signup);

router.post('/signin', userController.signin);

router.post('/signin/new_token', userController.refresh);

router.get('/info', AuthMiddleware, userController.info);

router.post('/file/upload', AuthMiddleware, upload.single('file'), fileController.upload);

router.get('/file/list', AuthMiddleware, fileController.list);

router.get('/file/:id', AuthMiddleware, fileController.getOne);

router.delete('/file/delete/:id', AuthMiddleware, fileController.delete);

router.get('/file/download/:id', AuthMiddleware, fileController.download);

router.put('/file/update/:id', AuthMiddleware, upload.single('file'), fileController.update);
