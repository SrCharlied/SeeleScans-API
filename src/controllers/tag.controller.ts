import { tagService } from '../services/tag.service';

type Ctx = { set: { status?: number | string } };

export const tagController = {
  async listAll({ set }: Ctx) {
    set.status = 200;
    return tagService.listAll();
  },
};
