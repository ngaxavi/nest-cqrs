import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersRepository } from './orders.repository';

function createRepository({
  findByIdAndDeleteResult = undefined,
  findByIdAndUpdateResult = undefined,
  findResult = [],
}: {
  findByIdAndDeleteResult?: unknown;
  findByIdAndUpdateResult?: unknown;
  findResult?: unknown[];
}): {
  repository: OrdersRepository;
  model: { find: jest.Mock; findByIdAndDelete: jest.Mock; findByIdAndUpdate: jest.Mock };
} {
  const limit = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(findResult) });
  const model = {
    find: jest.fn().mockReturnValue({ limit }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(findByIdAndDeleteResult),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(findByIdAndUpdateResult),
    }),
  };

  return { repository: new OrdersRepository(model as any), model };
}

describe('OrdersRepository', () => {
  describe('findAll', () => {
    it('uses the requested bounded limit before querying MongoDB', async () => {
      const { repository, model } = createRepository({ findResult: [{ orderNumber: 'order-123' }] });

      await repository.findAll(25);

      expect(model.find).toHaveBeenCalledWith();
      expect(model.find.mock.results[0].value.limit).toHaveBeenCalledWith(25);
    });
  });

  describe('deleteOne', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      const { repository } = createRepository({ findByIdAndDeleteResult: null });

      await expect(repository.deleteOne(new Types.ObjectId())).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns an aggregate containing the deleted document', async () => {
      const deletedDocument = { id: new Types.ObjectId().toHexString(), orderNumber: 'order-123' };
      const { repository } = createRepository({ findByIdAndDeleteResult: deletedDocument });

      const aggregate = await repository.deleteOne(new Types.ObjectId(deletedDocument.id));

      expect(aggregate.data).toBe(deletedDocument);
    });
  });

  describe('updateOne', () => {
    it('uses a validated ObjectId, schema validation, and returns the updated document', async () => {
      const id = new Types.ObjectId().toHexString();
      const updatedDocument = { id, orderNumber: 'order-123', status: 'DELIVERED' };
      const { repository, model } = createRepository({ findByIdAndUpdateResult: updatedDocument });
      const dto = { status: 'DELIVERED' };

      const aggregate = await repository.updateOne(id, dto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        new Types.ObjectId(id),
        { $set: dto },
        { new: true, runValidators: true },
      );
      expect(aggregate.data).toBe(updatedDocument);
    });

    it('throws NotFoundException when the order does not exist', async () => {
      const { repository } = createRepository({ findByIdAndUpdateResult: null });

      await expect(
        repository.updateOne(new Types.ObjectId().toHexString(), { status: 'DELIVERED' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
