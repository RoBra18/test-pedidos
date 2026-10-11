import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { PedidoDetalle } from '../src/pedidos/entities/pedido-detalle.entity';
import { Producto } from '../src/productos/producto.entity';
describe('Prueba de Concurrencia - Creación de Pedidos (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let productoTestId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (productoTestId) {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(PedidoDetalle)
        .where('productoId = :id', { id: productoTestId })
        .execute();

      await queryRunner.manager.delete(Producto, { id: productoTestId });

      await queryRunner.release();
    }

    await app.close();
  });

  beforeEach(async () => {
    const productoRepo = dataSource.getRepository(Producto);
    const nuevoProducto = await productoRepo.save(
      productoRepo.create({
        nombre: 'Producto Test Concurrencia',
        precio: 50.0,
        stock: 10,
        sku: "XYZ"
      }),
    );

    productoTestId = nuevoProducto.id;
  });

  it('debe prevenir sobreventa y respetar la consistencia ante 5 pedidos simultáneos', async () => {
    // Stock total disponible: 10 unidades.
    // 5 peticiones simultáneas intentando comprar 3 unidades cada una (15 unidades en total)
   
    const cantidadPorPedido = 3;
    const totalPeticiones = 5;

    const peticiones = Array.from({ length: totalPeticiones }).map((_, i) =>
      request(app.getHttpServer())
        .post('/pedidos')
        .send({
          clienteId: `CLI8888888888888888888-${i + 1}`,
          items: [
            {
              productoId: productoTestId,
              cantidad: cantidadPorPedido,
            },
          ],
        }),
    );

    
    const respuestas = await Promise.all(peticiones);

    const exitosas = respuestas.filter((res) => res.status === 201);
    const rechazadas = respuestas.filter(
      (res) => res.status === 409,
    );

    expect(rechazadas).toHaveLength(2);
    expect(exitosas).toHaveLength(3);
    
    const productoActualizado = await dataSource
      .getRepository(Producto)
      .findOneBy({ id: productoTestId });

    expect(productoActualizado).toBeDefined();
    expect(productoActualizado!.stock).toBe(1); //  1 restante
  });
});