USE examen_pedidos;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_PADDING ON;
GO
SET ANSI_WARNINGS ON;
GO
SET CONCAT_NULL_YIELDS_NULL ON;
GO
SET ARITHABORT ON;
GO
SET NUMERIC_ROUNDABORT OFF;
GO

IF OBJECT_ID('dbo.pedido_detalle', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.pedido_detalle (
        pedidoId INT NOT NULL,
        productoId INT NOT NULL,
        cantidad INT NOT NULL,
        precioUnitario DECIMAL(12,2) NOT NULL,

        subtotal AS (
            CONVERT(DECIMAL(12,2), cantidad * precioUnitario)
        ) PERSISTED,

        CONSTRAINT PK_pedido_detalle
            PRIMARY KEY (pedidoId, productoId),

        CONSTRAINT FK_pedido_detalle_pedidos
            FOREIGN KEY (pedidoId)
            REFERENCES dbo.pedidos(id),

        CONSTRAINT FK_pedido_detalle_productos
            FOREIGN KEY (productoId)
            REFERENCES dbo.productos(id),

        CONSTRAINT CK_pedido_detalle_cantidad
            CHECK (cantidad >= 1),

        CONSTRAINT CK_pedido_detalle_precio
            CHECK (precioUnitario >= 0)
    );
END

GO
