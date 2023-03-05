import {Item} from "../item";

it('should implement optimistic concurrency control', async () => {
  const item = Item.build({
    title: 'MBP',
    price: 1000,
    userId: '123'
  });

  await item.save();

  const fetchedItem1 = await Item.findById(item.id);
  const fetchedItem2 = await Item.findById(item.id);

  fetchedItem1!.set({price: 1500});
  fetchedItem2!.set({price: 2000});

  await fetchedItem1!.save();

  try {
    await fetchedItem2!.save();
  } catch (e) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('should increment version number on save', async () => {
  const item = Item.build({
    title: 'mbp',
    price: 10,
    userId: '123'
  });

  await item.save();
  expect(item.version).toEqual(0);

  await item.save();
  expect(item.version).toEqual(1);

  const fetchedItem = await Item.findById(item.id);
  expect(fetchedItem!.version).toEqual(1);
});