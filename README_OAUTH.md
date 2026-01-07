# Configuración de Google Sheets con OAuth 2.0

Debido a restricciones de seguridad en tu organización, usaremos **OAuth 2.0** en lugar de Service Accounts. Esto significa que autorizarás a la aplicación usando tu propia cuenta de Google.

## Pasos para Configurar

1.  **Crear Credenciales OAuth en Google Cloud**:
    *   Ve a [console.cloud.google.com](https://console.cloud.google.com/).
    *   Selecciona tu proyecto.
    *   Ve a **APIs y servicios** > **Credenciales**.
    *   Clic en **+ CREAR CREDENCIALES** > **ID de cliente de OAuth**.
    *   **Tipo de aplicación**: Elige **App de escritorio** (esto es lo más sencillo para obtener el token inicial).
    *   Dale un nombre (ej: "POS Local") y clic en **Crear**.
    *   Copia el **ID de cliente** y el **Secreto de cliente**.

2.  **Obtener el Refresh Token** (Solo necesitas hacerlo una vez):
    *   Necesitamos un "Refresh Token" para que la app pueda conectarse siempre sin pedirte login a cada rato.
    *   Ve al **OAuth 2.0 Playground**: [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
    *   Haz clic en el ícono de engranaje (⚙️) arriba a la derecha.
    *   Marca "Use your own OAuth credentials".
    *   Pega tu **OAuth Client ID** y **OAuth Client Secret** que copiaste en el paso 1.
    *   En la lista de APIs (izquierda), busca "Google Sheets API v4" y selecciona `https://www.googleapis.com/auth/spreadsheets`.
    *   Clic en **Authorize APIs**.
    *   Inicia sesión con tu cuenta de Google y permite el acceso.
    *   Te devolverá al Playground. Haz clic en el botón azul **"Exchange authorization code for tokens"**.
    *   Copia el **Refresh Token** (es una cadena larga).

3.  **Configurar Variables de Entorno**:
    *   Abre el archivo `.env.local` en tu proyecto.
    *   Pega tus credenciales:

```env
GOOGLE_CLIENT_ID=tu_cliente_id_aqui
GOOGLE_CLIENT_SECRET=tu_secreto_aqui
GOOGLE_REFRESH_TOKEN=tu_refresh_token_aqui
GOOGLE_SHEET_ID=el_id_de_tu_hoja
```

4.  **Listo**:
    *   Reinicia tu servidor (`Ctrl+C` y `npm run dev`) y la aplicación ya tendrá acceso.
