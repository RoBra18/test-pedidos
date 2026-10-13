import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CrearPedidoDto } from './dtos/crear-pedido.dto';
import { PedidoRespuestaDto } from './dtos/pedido-respuesta.dto';
import { CrearPedidoItemDto } from './dtos/crear-pedidoitem.dto';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Pedido } from './entities/pedido.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EstadoPedido, EstadoPedidoTexto } from './enums/estado-pedido.enum';
import { Producto } from '../productos/producto.entity';

@Injectable()
export class PedidosService {
    constructor(private readonly dataSource: DataSource,
        @InjectRepository(Pedido)
        private readonly pedidosRepo: Repository<Pedido>,
    ) { }

    async crear(dto: CrearPedidoDto): Promise<PedidoRespuestaDto> {
        return this.dataSource.transaction(async (manager) => {
            const productosMap = await this.obtenerProductosBloqueados(manager, dto.items);

            let totalPedido = 0;
            const detalles: PedidoDetalle[] = [];

            for (const item of dto.items) {
                const producto = productosMap.get(item.productoId)!;

                if (item.cantidad > producto.stock) {
                    throw new ConflictException(
                        `Stock insuficiente para el producto ${producto.id}. Disponible: ${producto.stock}`,
                    );
                }

                producto.stock = producto.stock - item.cantidad;

                const precio = producto.precio;
                totalPedido += precio * item.cantidad;

                detalles.push(
                    manager.create(PedidoDetalle, {
                        productoId: producto.id,
                        cantidad: item.cantidad,
                        precioUnitario: precio,
                    }),
                );
            }

            await manager.save(Array.from(productosMap.values()));

            const pedido = await manager.save(
                manager.create(Pedido, {
                    clienteId: dto.clienteId,
                    estado: EstadoPedido.CREADO,
                    total: totalPedido,
                    detalles,
                }),
            );

            return {
                id: pedido.id,
                clienteId: pedido.clienteId,
                estado: EstadoPedidoTexto[pedido.estado],
                creadoEn: pedido.creadoEn.toISOString(),
                total: pedido.total,
                items: pedido.detalles.map((detalle) => ({
                    productoId: detalle.productoId,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    subtotal: detalle.cantidad * detalle.precioUnitario,
                })),
            };
        });
    }

    private async obtenerProductosBloqueados(
        manager: EntityManager,
        items: CrearPedidoItemDto[]): Promise<Map<number, Producto>> {
        const idsOrdenados = [...items.map((item) => item.productoId)].sort((a, b) => a - b);

        const productos = await manager
            .getRepository(Producto)
            .createQueryBuilder('producto')
            .setLock('pessimistic_write')
            .where('producto.id IN (:...ids)', { ids: idsOrdenados })
            .orderBy('producto.id', 'ASC')
            .getMany();

        if (productos.length !== idsOrdenados.length) {
            throw new NotFoundException('Uno o más productos no existen');
        }

        return new Map(productos.map((producto) => [producto.id, producto]));
    }

    async obtenerPorId(id: number): Promise<PedidoRespuestaDto> {
        const pedido = await this.pedidosRepo.findOne({
            where: { id },
            relations: {
                detalles: true,
            },
        });

        if (!pedido) {
            throw new NotFoundException(`El pedido con ID ${id} no existe`);
        }

        return PedidoRespuestaDto.desdeEntidad(pedido);
    }
}
