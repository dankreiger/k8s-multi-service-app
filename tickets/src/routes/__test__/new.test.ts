import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

describe('new', () => {
  it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});
    expect(response.status).not.toBe(404);
  });
  it('can only be accessed if the user is signed in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
  });
  it('returns status other than 401 if user is signed in', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({});
    expect(response.status).not.toBe(401);
  });
  it('returns an error if an invalid title is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: '',
        price: 10,
      })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        price: 10,
      })
      .expect(400);
  });
  it('returns an error if an invalid price is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'ksksjkjdh',
        price: -10,
      })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'ksksjkjdh',
      })
      .expect(400);
  });
  it('creates a ticket with valid inputs', async () => {
    // add in a check to make sure a ticket was saved
    let tickets = await Ticket.find({});
    expect(tickets.length).toBe(0);

    const title = 'djdoidjoijd';
    const price = 50;
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price,
      })
      .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toBe(1);
    expect(tickets[0].title).toBe(title);
    expect(tickets[0].price).toBe(price);
  });
});
