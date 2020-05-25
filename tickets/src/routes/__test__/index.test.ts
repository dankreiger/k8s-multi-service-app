import request from 'supertest';
import { app } from '../../app';

const createTicket = () =>
  request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'dldkjldj',
    price: 20,
  });

describe('index', () => {
  it('can fetch a list of tickets', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app).get('/api/tickets').send().expect(200);

    expect(response.body.length).toBe(3);
  });
});
