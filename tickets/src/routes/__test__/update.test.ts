import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

describe('update', () => {
  it('returns a 404 if the provided id does not exist', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({ title: 'flkjlfkj', price: 20 })
      .expect(404);
  });
  it('returns a 401 if the user is not authenticated', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({ title: 'flkjlfkj', price: 20 })
      .expect(401);
  });

  it('returns a 401 if the user does not own the ticket', async () => {
    const initialTicket = { title: 'ddlkjdlkdjldk', price: 20 };
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send(initialTicket);

    const updatedTicket = {
      title: 'djjdoidjodijdoijdoicn',
      price: 30,
    };

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send(updatedTicket)
      .expect(401);

    // verify update was not processed
    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();

    expect(ticketResponse.body).toEqual(expect.objectContaining(initialTicket));
  });
  it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'dlmldkmldkm', price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: '', price: 20 })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'dlmldkmdlkm', price: -10 })
      .expect(400);
  });
  it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'dlmldkmldkm', price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'Dog', price: 200 })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();

    expect(ticketResponse.body.title).toBe('Dog');
    expect(ticketResponse.body.price).toBe(200);
  });
});
