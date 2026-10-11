import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../productos/producto.entity';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Pedido, PedidoDetalle])],
  controllers: [PedidosController],
  providers: [PedidosService]
})
export class PedidosModule {}
