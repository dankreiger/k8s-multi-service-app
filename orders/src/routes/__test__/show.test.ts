import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

describe('show', () => {
  it('fetches the order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();
    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make request to fetch order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);

    expect(fetchedOrder.id).toBe(order.id);
  });

  it('returns not found if order does not exist', async () => {
    const nonExistentOrderId = mongoose.Types.ObjectId().toHexString();

    // Create a ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();
    // make a request to build an order with this ticket
    await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make request to fetch order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${nonExistentOrderId}`)
      .set('Cookie', user)
      .send()
      .expect(404);

    expect(fetchedOrder.id).toBeUndefined();
  });

  it('returns not authorized if order user id does not match the current user id', async () => {
    // Create a ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),

      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const userOne = global.signin();
    const userTwo = global.signin();
    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', userOne)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make request to fetch order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', userTwo)
      .send()
      .expect(401);

    expect(fetchedOrder.id).toBeUndefined();
  });
});
