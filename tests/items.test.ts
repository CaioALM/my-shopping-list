import { createWriteStream } from 'fs';
import supertest from 'supertest';
import app from '../src/app';
import { prisma } from '../src/database'
import itemsFactory from './factories/itemsFactory'
import numberFactory from './factories/numberFactory';

beforeEach( async() => {
  await prisma.$executeRaw`TRUNCATE TABLE "items"`
})

describe('Testa POST /items ', () => {
  it('Deve retornar 201, se cadastrado um item no formato correto', async() => {
      const item = await itemsFactory();
      
      const result = await supertest(app).post(`/items`).send(item);

      const createdItem = await prisma.items.findUnique({
        where: {title: item.title }
      });

      expect(result.status).toBe(201);
      expect(createdItem).not.toBeNull();
  });


  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    const item = await itemsFactory()
    await supertest(app).post(`/items`).send(item);
    const result = await supertest(app).post(`/items`).send(item);

    expect(result.status).toBe(409);

  })
});

describe('Testa GET /items ', () => {
  it('Deve retornar status 200 e o body no formato de Array', async() => {

    const result = await supertest(app).get(`/items`).send();

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
  } )
});

describe('Testa GET /items/:id ', () => {
  it('Deve retornar status 200 e um objeto igual a o item cadastrado', async () => {
    const item = await itemsFactory()
  
    const createdItem = await supertest(app).post(`/items`).send(item);

    const { id } = createdItem.body;
    const result = await supertest(app).get(`/items/${id}`).send();


    expect(result.status).toBe(200)
    expect(result.body).toBe(item)
  });
 

  it('Deve retornar status 404 caso não exista um item com esse id', async () => {

    const number = await numberFactory()
    
    const result = await supertest(app).get(`/items/${number.random}`).send();

    expect(result.status).toBe(404)

  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
