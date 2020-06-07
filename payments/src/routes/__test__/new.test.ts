import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@puppytickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { mockChargeId } from '../../test/setup';

jest.mock('../../stripe');

describe('new', () => {
  it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin())
      .send({
        token: 'dlkljdkj',
        orderId: mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId: mongoose.Types.ObjectId().toHexString(), // could be any value
      status: OrderStatus.Created,
      version: 0,
      price: 10,
    });

    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin())
      .send({
        token: 'dlkljdkj',
        orderId: order.id,
      })
      .expect(401);
  });

  it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId, // could be any value
      status: OrderStatus.Cancelled,
      version: 0,
      price: 10,
    });

    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin(userId))
      .send({
        token: 'dlkljdkj',
        orderId: order.id,
      })
      .expect(400);
  });

  it('returns a 204 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId, // could be any value
      status: OrderStatus.Created,
      version: 0,
      price: 10,
    });

    await order.save();
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin(userId))
      .send({
        token: 'tok_visa',
        orderId: order.id,
      })
      .expect(204);

    // we could write this against the real stripe API, but for now I'd rather not
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toBe('tok_visa');
    expect(chargeOptions.amount).toBe(order.price * 100);
    expect(chargeOptions.currency).toBe('eur');

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: mockChargeId,
    });

    expect(payment).not.toBeNull();

    const wrongPayment = await Payment.findOne({
      orderId: order.id,
      stripeId: 'dog',
    });
    expect(wrongPayment).toBeNull();
  });
});
