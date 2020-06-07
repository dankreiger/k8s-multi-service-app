import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, Subjects } from '@puppytickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Concert',
    price: 20,
    userId: 'dkjldjk',
  });

  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

describe('OrderCancelledListener', () => {
  it('updates the ticket', async () => {
    const { msg, data, ticket, orderId, listener } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
  });

  it('publishes an event', async () => {
    const { msg, data, ticket, listener } = await setup();
    await listener.onMessage(data, msg);

    const mockPublish = natsWrapper.client.publish as jest.Mock;

    expect(mockPublish).toHaveBeenCalled();

    expect(mockPublish.mock.calls[0][0]).toBe(Subjects.TicketUpdated);

    const publishPayload = JSON.parse(mockPublish.mock.calls[0][1]);
    expect(publishPayload.orderId).not.toBeDefined();
    expect(publishPayload.title).toBe(ticket.title);
    expect(publishPayload.price).toBe(ticket.price);
    expect(publishPayload.version).toBe(ticket.version + 1);
  });

  it('acks the message', async () => {
    const { msg, data, ticket, listener } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
