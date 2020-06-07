import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus, Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects } from '@puppytickets/common';

describe('cancel', () => {
  it('marks an order as cancelled', async () => {
    // Create a ticket with Ticket Model
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();
    const user = global.signin();
    // make request to create an order
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(order.status).toBe(OrderStatus.Created);
    // make request to cancel order
    await request(app)
      .patch(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(200);

    const cancelledOrder = await Order.findById(order.id);

    // expect that order status is cancelled
    expect(cancelledOrder!.status).toBe(OrderStatus.Cancelled);
  });

  it('emits a order cancelled event', async () => {
    // Create a ticket with Ticket Model
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();
    const user = global.signin();
    // make request to create an order
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(order.status).toBe(OrderStatus.Created);
    expect(natsWrapper.client.publish).toHaveBeenCalledWith(
      Subjects.OrderCreated,
      JSON.stringify({
        id: order.id,
        status: OrderStatus.Created,
        version: order.version,
        userId: order.userId,
        expiresAt: order.expiresAt,
        ticket: { id: ticket.id, price: ticket.price },
      }),
      expect.any(Function)
    );
    jest.clearAllMocks();
    // make request to cancel order
    await request(app)
      .patch(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalledWith(
      Subjects.OrderCancelled,
      JSON.stringify({
        id: order.id,
        version: order.version + 1,
        ticket: { id: ticket.id },
      }),
      expect.any(Function)
    );
  });
});
