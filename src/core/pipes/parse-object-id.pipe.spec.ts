import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('returns a mongoose ObjectId for a valid identifier', () => {
    const id = new Types.ObjectId().toHexString();

    expect(pipe.transform(id)).toEqual(new Types.ObjectId(id));
  });

  it.each(['not-an-object-id', '', '123'])('rejects invalid identifier %s', (id) => {
    expect(() => pipe.transform(id)).toThrow(BadRequestException);
  });
});
