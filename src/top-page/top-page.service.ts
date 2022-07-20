import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { TopLevelCategory, TopPageModel } from './top-page.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { CreateTopPageDto } from './dto/create-topPage.dto';

@Injectable()
export class TopPageService {
  constructor(
    @InjectModel(TopPageModel)
    private readonly topPageModel: ModelType<TopPageModel>,
  ) {}

  async create(dto: CreateTopPageDto) {
    return this.topPageModel.create(dto);
  }

  async findById(id: string) {
    const page = await this.topPageModel.findById(id).exec();
    if (!page) {
      throw new NotFoundException("Such page doesn't exist");
    }
    return page;
  }

  async deleteById(id: string) {
    const page = await this.topPageModel.findByIdAndDelete(id).exec();
    if (!page) {
      throw new NotFoundException("Such page doesn't exist");
    }
    return page;
  }

  async updateById(id: string, dto: CreateTopPageDto) {
    const page = await this.topPageModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!page) {
      throw new NotFoundException("Such page doesn't exist");
    }
    return page;
  }

  async findByAlias(alias: string) {
    return this.topPageModel.findOne({ alias }).exec();
  }

  async findByCategory(firstCategory: TopLevelCategory) {
    return (
      this.topPageModel
        // .find({{ firstCategory }, { alias: 1, title: 1, secondCategory: 1 }) возвратит только часть модели
        /*.aggregate([
          {
            $match: {
              firstCategory,
            },
          },
          {
            $group: {
              _id: { secondCategory: '$secondCategory' },
              pages: { $push: { alias: '$alias', title: '$title' } },
            },
          },
        ])*/
        .aggregate()
        .match({ firstCategory })
        .group({
          _id: { secondCategory: '$secondCategory' },
          pages: { $push: { alias: '$alias', title: '$title' } },
        })
        .exec()
    );
  }

  async findByText(text: string) {
    return this.topPageModel
      .find({
        $text: { $search: text, $caseSensitive: false },
      })
      .exec();
  }
}
