# Despliegue en Windows IIS

Si ya tienes un servidor IIS configurado, **NO basta con copiar los archivos**. Next.js es una aplicación de Node.js, no son archivos HTML estáticos.

Para que funcione en IIS necesitas usar el módulo **iisnode**.

## Requisitos Previos en el Servidor
1.  **Node.js**: Debe estar instalado en el servidor (la misma versión o superior que usaste para desarrollar).
2.  **IISnode**: Descarga e instala [iisnode](https://github.com/azure/iisnode) (asegúrate de instalar la versión x64 si tu servidor es de 64 bits).
3.  **URL Rewrite**: Instala el módulo [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) para IIS.

## Pasos para Desplegar

1.  **Copiar Archivos**:
    Copia **toda la carpeta del proyecto** (excepto `node_modules` y `.git`) a tu carpeta de IIS (ej: `C:\inetpub\wwwroot\pos-app`).
    *   Incluye `.next` (carpeta oculta creada con `npm run build`).
    *   Incluye `public`.
    *   Incluye `server.js` (lo acabo de crear).
    *   Incluye `web.config` (lo acabo de crear).
    *   Incluye `.env.local`.
    *   Incluye `package.json`.

2.  **Instalar Dependencias en el Servidor**:
    Abre una terminal (PowerShell) **en la carpeta del servidor** y ejecuta:
    ```powershell
    npm install --production
    ```
    *(Esto creará la carpeta `node_modules` allí mismo).*

3.  **Configurar IIS**:
    *   Abre el Administrador de IIS.
    *   Crea un nuevo sitio o aplicación apuntando a esa carpeta.
    *   Gracias al archivo `web.config` que te creé, IIS ya sabrá que debe usar `server.js` para arrancar la app.

## Sobre HTTPS y Ngrok

Si tu servidor IIS ya tiene un certificado SSL (HTTPS), ¡perfecto! No necesitas Ngrok.

Si tu servidor IIS **solo tiene HTTP**, entonces **SÍ necesitas un túnel** para que la cámara funcione.
*   **Ngrok**: Es una excelente opción.
    *   Instala Ngrok en el servidor.
    *   Ejecuta: `ngrok http 80` (o el puerto que use tu IIS).
    *   Ngrok te dará una URL segura (`https://...`) que redirige a tu IIS local.
