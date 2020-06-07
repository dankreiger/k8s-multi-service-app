import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus, Subjects } from '@puppytickets/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 99,
    userId: 'ldjfnkjn',
  });

  // Save ticket
  await ticket.save();

  // Create fake data object
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'dlkndkldn',
    expiresAt: 'dlkdlkdmldkm',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

describe('OrderCreatedListener', () => {
  it('sets the userId of the ticket', async () => {
    const { listener, data, ticket, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toBe(data.id);
  });
  it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const mockPublish = natsWrapper.client.publish as jest.Mock;

    expect(mockPublish).toHaveBeenCalled();

    expect(mockPublish.mock.calls[0][0]).toBe(Subjects.TicketUpdated);

    const { orderId } = JSON.parse(mockPublish.mock.calls[0][1]);
    expect(orderId).toBe(data.id);
  });
});
