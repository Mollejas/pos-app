# Configuración de Google Sheets para POS

Para que la aplicación funcione, necesitas configurar una cuenta de servicio de Google Cloud y una hoja de cálculo.

## Pasos:

1. **Crear un Proyecto en Google Cloud Console**:
   - Ve a [console.cloud.google.com](https://console.cloud.google.com/).
   - Crea un nuevo proyecto.

2. **Habilitar la API de Google Sheets**:
   - Busca "Google Sheets API" en la biblioteca de APIs y habilítala.

3. **Crear una Cuenta de Servicio (Service Account)**:
   - Ve a "IAM y administración" > "Cuentas de servicio".
   - Crea una nueva cuenta de servicio.
   - Crea una clave JSON para esta cuenta y descárgala.

4. **Configurar Variables de Entorno**:
   - Abre el archivo `.env.local` en la raíz del proyecto (créalo si no existe).
   - Copia el `client_email` del JSON a `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
   - Copia el `private_key` del JSON a `GOOGLE_PRIVATE_KEY` (asegúrate de incluir los saltos de línea `\n` tal cual, o reemplázalos correctamente).

5. **Crear la Hoja de Cálculo**:
   - Crea una nueva hoja en Google Sheets.
   - Copia el ID de la URL (la parte larga entre `/d/` y `/edit`).
   - Pega el ID en `GOOGLE_SHEET_ID` en `.env.local`.

6. **Compartir la Hoja**:
   - Comparte la hoja de cálculo con el email de la cuenta de servicio (`client_email`) con permisos de **Editor**.

7. **Inicializar Hojas**:
   - Abre la aplicación (`npm run dev`).
   - Navega a `http://localhost:3000/api/init` para crear automáticamente las pestañas necesarias (`Productos`, `Clientes`, `Ventas`, etc.).

## Ejemplo .env.local

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta-de-servicio@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1xXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
