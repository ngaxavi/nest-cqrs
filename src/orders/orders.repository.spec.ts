import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersRepository } from './orders.repository';

function createRepository(findByIdAndDeleteResult: unknown): OrdersRepository {
  const model = {
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(findByIdAndDeleteResult),
    }),
  };

  return new OrdersRepository(model as any);
}

describe('OrdersRepository', () => {
  describe('deleteOne', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      const repository = createRepository(null);

      await expect(repository.deleteOne(new Types.ObjectId())).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns an aggregate containing the deleted document', async () => {
      const deletedDocument = { id: new Types.ObjectId().toHexString(), orderNumber: 'order-123' };
      const repository = createRepository(deletedDocument);

      const aggregate = await repository.deleteOne(new Types.ObjectId(deletedDocument.id));

      expect(aggregate.data).toBe(deletedDocument);
    });
  });
});
