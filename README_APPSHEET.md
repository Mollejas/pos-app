# Guía de Integración con AppSheet

La "magia" de esta integración es que tanto tu **Punto de Venta Web (Next.js)** como **AppSheet** comparten la misma base de datos: tu archivo de **Google Sheets**.

Cualquier cambio que hagas en la web se verá en AppSheet y viceversa.

## Pasos para crear la App en AppSheet

1.  **Ingresa a AppSheet**:
    *   Ve a [www.appsheet.com](https://www.appsheet.com) e inicia sesión con la misma cuenta de Google donde tienes tu hoja de cálculo.

2.  **Crear Nueva App**:
    *   Clic en **"Create"** > **"App"** > **"Start with existing data"**.
    *   Dale un nombre a tu app (ej: "POS Móvil").
    *   Selecciona **"Google Sheets"** como fuente de datos.
    *   Busca y selecciona el archivo de Excel/Sheets que creaste para este sistema (el mismo ID que pusiste en `.env.local`).

3.  **Configurar las Tablas (Tables)**:
    AppSheet detectará automáticamente las pestañas. Asegúrate de agregarlas así:

    ### Tabla: `Productos`
    *   **Source**: Pestaña `Productos`.
    *   **Column Structure**:
        *   `code`: **Key**, Type: `Text` (o `Ref` si quisieras, pero Text está bien). Habilitar "Scannable" para escanear con el celular.
        *   `description`: Type: `Text`, **Label**.
        *   `price`: Type: `Price` (Symbol `$`).

    ### Tabla: `Clientes`
    *   **Source**: Pestaña `Clientes`.
    *   **Column Structure**:
        *   `id`: **Key**, Type: `Text` (o usar `UNIQUEID()` como fórmula inicial).
        *   `name`: Type: `Name`, **Label**.
        *   `email`: Type: `Email`.
        *   `phone`: Type: `Phone`.

    ### Tabla: `Ventas`
    *   **Source**: Pestaña `Ventas`.
    *   **Column Structure**:
        *   `folio`: **Key**, Type: `Number`.
        *   `date`: Type: `DateTime`.
        *   `customerId`: Type: `Ref` -> Source Table: `Clientes`.
        *   `total`: Type: `Price`.

    ### Tabla: `DetalleVentas`
    *   **Source**: Pestaña `DetalleVentas`.
    *   **Column Structure**:
        *   `folio`: Type: `Ref` -> Source Table: `Ventas`. (Marcar "Is a part of?" como TRUE para que aparezca dentro de la venta).
        *   `productCode`: Type: `Ref` -> Source Table: `Productos`.
        *   `quantity`: Type: `Number`.
        *   `price`: Type: `Price`.
        *   `subtotal`: Type: `Price` (Formula: `[quantity] * [price]`).

4.  **Crear Vistas (UX)**:
    *   Crea una vista tipo **Deck** o **Table** para `Productos` (para administrar precios desde el celular).
    *   Crea una vista tipo **Dashboard** para ver las `Ventas` recientes.

## Recomendaciones de Uso

*   **Administración (AppSheet)**: Usa AppSheet en tu celular para:
    *   Dar de alta productos nuevos rápidamente (puedes usar la cámara del celular para escanear el código de barras al crear el producto).
    *   Cambiar precios.
    *   Ver reportes de ventas desde cualquier lugar.
*   **Venta (Web POS)**: Usa la aplicación Web (Next.js) para:
    *   Realizar el cobro en el mostrador.
    *   Generar los tickets PDF.
    *   Escanear rápido con lector USB o cámara web.

## Nota sobre los Folios

El sistema web gestiona el folio autoincrementable usando la hoja `Config`. Si creas una venta **directamente desde AppSheet**, el folio no se autoincrementará automáticamente a menos que configures fórmulas complejas en AppSheet.

**Recomendación**: Usa AppSheet solo para **CONSULTAR** ventas y **ADMINISTRAR** productos/clientes. Deja que la Web haga las ventas para mantener el orden de los folios.
