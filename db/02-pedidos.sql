USE examen_pedidos;
GO
IF OBJECT_ID('dbo.pedidos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.pedidos (
        id INT IDENTITY(1,1) NOT NULL,
        clienteId NVARCHAR(36) NOT NULL,

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
