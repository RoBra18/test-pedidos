IF OBJECT_ID('dbo.pedidos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.pedidos (
        id INT IDENTITY(1,1) NOT NULL,
        clienteId NVARCHAR(15) NOT NULL,

        estado TINYINT NOT NULL
            CONSTRAINT DF_pedidos_estado DEFAULT (1),

        creadoEn DATETIME2(0) NOT NULL
            CONSTRAINT DF_pedidos_creadoEn DEFAULT (SYSDATETIME()),

        actualizadoEn DATETIME2(0) NULL,

        eliminadoEn DATETIME2(0) NULL,

        estaEliminado BIT NOT NULL
            CONSTRAINT DF_pedidos_estaEliminado DEFAULT (0),

        total DECIMAL(12,2) NOT NULL
            CONSTRAINT DF_pedidos_total DEFAULT (0.00),

        CONSTRAINT PK_pedidos PRIMARY KEY (id),

        CONSTRAINT CK_pedidos_estado
            CHECK (estado IN (1)),

        CONSTRAINT CK_pedidos_total
            CHECK (total >= 0),

        CONSTRAINT CK_pedidos_eliminacion
            CHECK (
                (estaEliminado = 0 AND eliminadoEn IS NULL)
                OR
                (estaEliminado = 1 AND eliminadoEn IS NOT NULL)
            )
    );
END
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
