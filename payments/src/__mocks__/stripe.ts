import { mockChargeId } from '../test/setup';

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: mockChargeId }),
  },
};
