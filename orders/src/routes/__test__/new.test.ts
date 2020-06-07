import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects } from '@puppytickets/common';

describe('new', () => {
  it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/orders').send({});
    expect(response.status).not.toBe(404);
  });
  it('can only be accessed if the user is signed in', async () => {
    await request(app).post('/api/orders').send({}).expect(401);
  });
  it('returns status other than 401 if user is signed in', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({});
    expect(response.status).not.toBe(401);
  });

  it('returns an error if ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId })
      .expect(404);
  });
  it('returns an error if ticket is already reserved', async () => {
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'Concert',
      price: 20,
    });
    await ticket.save();

    const order = Order.build({
      ticket,
      userId: 'dlkmdlkdmon',
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    await order.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(400, { errors: [{ message: 'Ticket is already reserved' }] });
  });
  it('reserves a ticket', async () => {
    let orders = await Order.find({});
    expect(orders).toHaveLength(0);

    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'Concert',
      price: 20,
    });

    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);

    orders = await Order.find({});
    expect(orders).toHaveLength(1);
    expect(orders[0].status).toBe(OrderStatus.Created);
  });

  it('emits an order created event', async () => {
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'Concert',
      price: 20,
    });

    await ticket.save();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
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
  });
});
