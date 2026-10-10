import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Producto } from './producto.entity';
import { ProductosService } from './productos.service';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los productos' })
  @ApiOkResponse({ type: [Producto] })
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un producto por id' })
  @ApiOkResponse({ type: Producto })
  @ApiNotFoundResponse({ description: 'El producto no existe' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }
}
