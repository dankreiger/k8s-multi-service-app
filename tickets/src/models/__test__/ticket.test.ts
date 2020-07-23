import { Ticket } from '../ticket';

describe('ticket', () => {
  it('implements optimistic concurrency control', async (done) => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
      title: 'concert',
      price: 5,
      userId: '123',
    });

    // Save ticket to database
    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two separate changes to the tickets we fetched
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket and expect an error
    try {
      await secondInstance!.save();
    } catch (err) {
      return done();
    }

    throw new Error('Should not reach this point');
  });

  it('increments the version number on multiple saves', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
      title: 'concert',
      price: 5,
      userId: '123',
    });

    // Save ticket to database
    await ticket.save();
    expect(ticket.version).toBe(0);

    await ticket.save();
    expect(ticket.version).toBe(1);

    await ticket.save();
    expect(ticket.version).toBe(2);
  });
});
