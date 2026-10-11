import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CrearPedidoDto } from './dtos/crear-pedido.dto';
import { PedidoRespuestaDto } from './dtos/pedido-respuesta.dto';
import { CrearPedidoItemDto } from './dtos/crear-pedidoitem.dto';
import { Producto } from 'src/productos/producto.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Pedido } from './entities/pedido.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PedidosService {
    constructor(private readonly dataSource: DataSource,
            @InjectRepository(Pedido)
                private readonly productos: Repository<Pedido>,
    ) { }

    async crear(dto: CrearPedidoDto): Promise<PedidoRespuestaDto> {
        return this.dataSource.transaction(async (manager) => {
            const productos = await this.obtenerProductosBloqueados(manager, dto.items);

            const detalles = dto.items.map((item) => {
                const producto = productos.get(item.productoId);

                return {
                    productoId: producto!.id,
                    cantidad: item.cantidad,
                    precioUnitario: producto!.precio
                }
            })

            const totalPedido = Number(detalles.reduce(
                (totalAcumulado, detalle) =>
                    totalAcumulado + detalle.precioUnitario * detalle.cantidad, 0)
            )

            const productosRepository = manager.getRepository(Producto);

            for (const item of dto.items) {
                const producto = productos.get(item.productoId);
                await productosRepository.update({ id: producto!.id }, { stock: producto!.stock - item.cantidad })

            }

            const pedidosRepository = manager.getRepository(Pedido);

            const pedido = await pedidosRepository.save(pedidosRepository.create({
                clienteId: dto.clienteId,
                estado: 1,
                total: totalPedido
            }));

            const detalleRepository = manager.getRepository(PedidoDetalle);

            const detallesGuardados = await detalleRepository.save(detalles.map((detalle =>
                detalleRepository.create({
                    pedidoId: pedido.id,
                    productoId: detalle.productoId,
                    precioUnitario: detalle.precioUnitario,
                    cantidad: detalle.cantidad
                })
            )))


            return {
                id: pedido.id,
                clienteId: pedido.clienteId,
                estado: 'CREADO',
                creadoEn: pedido.creadoEn.toISOString(),
                total: totalPedido,
                items: detallesGuardados.map((detalle) => ({
                    productoId: detalle.productoId,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    subtotal: detalle.cantidad * detalle.precioUnitario,
                })),
            };
        })
    }

    private async obtenerProductosBloqueados(manager: EntityManager, items: CrearPedidoItemDto[]): Promise<Map<number, Producto>> {
        const productosRepository = manager.getRepository(Producto);
        const productos = new Map<number, Producto>();

        const itemsOrdenadosCopia = [...items].sort((a, b) => a.productoId - b.productoId);

        for (const item of itemsOrdenadosCopia) {

            const producto = await productosRepository.createQueryBuilder("producto")
                .setLock("pessimistic_write")
                .where("producto.id = :id", { id: item.productoId })
                .getOne();

            if (producto === null) {
                throw new NotFoundException();
            }
            if (item.cantidad > producto.stock) {
            }

            productos.set(producto.id, producto);

        }
        return productos;
    }
}
