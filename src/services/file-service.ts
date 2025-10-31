import { prisma } from '../prismaClient.js';

class FileService {
  async createFileRecord(file: Express.Multer.File) {
    const originalName = file.originalname;
    const parts = originalName.split('.');
    const extension = parts.length > 1 ? (parts.pop() ?? '') : '';
    const name = parts.join('.') || originalName;

    return prisma.fileRecord.create({
      data: {
        originalName,
        name,
        extension,
        mime: file.mimetype,
        size: file.size,
        path: file.path,
      },
    });
  }

  async listFiles(opts: { page?: number; listSize?: number } = {}) {
    const page = Math.max(1, Math.floor(opts.page ?? 1));
    const listSize = Math.max(1, Math.floor(opts.listSize ?? 10));
    const take = Math.min(listSize, 100);
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      prisma.fileRecord.findMany({
        skip,
        take,
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.fileRecord.count(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / take));

    return { items, pagination: { page, listSize: take, total, totalPages } };
  }
}

export const fileService = new FileService();
