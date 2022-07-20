import {
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FileElementResponse } from './dto/file-element.response';
import { FilesService } from './files.service';
import { MFile } from './mFile.class';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @HttpCode(200)
  @Post('upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('files'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileElementResponse[]> {
    const saveArray: MFile[] = [new MFile(file)];
    if (file.mimetype.includes('image')) {
      const webP = await this.filesService.convertToWebP(file.buffer);
      saveArray.push(
        new MFile({
          originalname: `${file.originalname.split('.')[0]}.webp`,
          buffer: webP,
        }),
      );
    }
    return this.filesService.saveFiles(saveArray);
  }
}
