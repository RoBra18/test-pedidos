import { Body, Controller, Post } from '@nestjs/common';
import { CrearPedidoDto } from './dtos/crear-pedido.dto';
import { PedidoRespuestaDto } from './dtos/pedido-respuesta.dto';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {

    constructor(private readonly pedidosService : PedidosService){

    }

    @Post()
    crear(@Body() crearPedidoDto : CrearPedidoDto) : PedidoRespuestaDto {
        return this.pedidosService.crear(crearPedidoDto);
    }
}
