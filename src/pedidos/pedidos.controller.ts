import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CrearPedidoDto } from './dtos/crear-pedido.dto';
import { PedidoRespuestaDto } from './dtos/pedido-respuesta.dto';
import { PedidosService } from './pedidos.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('pedidos')
export class PedidosController {

    constructor(private readonly pedidosService: PedidosService) {

    }

    @ApiOperation({
        summary: 'Crear un nuevo pedido',
        description:
            'Crea un pedido validando stock de forma atómica y aplicando bloqueo pesimista.',
    })
    @ApiCreatedResponse({
        description: 'Pedido creado exitosamente.',
        type: PedidoRespuestaDto,
    })
    @ApiBadRequestResponse({
        description:
            'Datos de entrada inválidos (DTO mal formado, cantidades negativas, etc.).',
    })
    @ApiConflictResponse({
        description: 'Stock insuficiente para uno o más productos.',
    })
    @ApiNotFoundResponse({
        description: 'Uno o más productos especificados no existen.',
    })

    @Post()
    async crear(@Body() crearPedidoDto: CrearPedidoDto): Promise<PedidoRespuestaDto> {
        return await this.pedidosService.crear(crearPedidoDto);
    }



    @ApiOperation({
        summary: 'Consultar un pedido por ID',
        description: 'Retorna los datos del pedido y sus detalles.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Identificador único del pedido',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Pedido devuelto exitosamente.',
        type: PedidoRespuestaDto,
    })
    @ApiBadRequestResponse({
        description: 'El ID proporcionado no es un número entero válido.',
    })
    @ApiNotFoundResponse({
        description: 'El pedido con el ID especificado no existe.',
    })
    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<PedidoRespuestaDto> {
        return this.pedidosService.obtenerPorId(id);
    }
}
