# Guía de Despliegue en Vercel (Recomendado)

Para que tus clientes puedan usar la aplicación desde cualquier lugar y con **HTTPS seguro** (necesario para el escáner de códigos), la mejor opción es **Vercel**. Es gratuito para uso personal y prototipos.

## Pasos para Publicar

### 1. Preparar el Código (GitHub)
1.  Crea una cuenta en [GitHub.com](https://github.com/) si no tienes una.
2.  Descarga e instala [GitHub Desktop](https://desktop.github.com/) (es más fácil) o usa la terminal.
3.  **Sube tu carpeta `pos-app` a un nuevo repositorio**:
    *   Abre GitHub Desktop.
    *   File > Add Local Repository > Selecciona la carpeta `pos-app`.
    *   Clic en "Publish repository".
    *   Asegúrate de desmarcar "Keep this code private" si quieres que sea fácil de importar, o déjalo privado (Vercel funciona con ambos).

### 2. Conectar con Vercel
1.  Ve a [Vercel.com](https://vercel.com/signup) y regístrate con tu cuenta de **GitHub**.
2.  En el panel principal (Dashboard), haz clic en el botón blanco **"Add New..."** -> **"Project"**.
3.  Verás tu repositorio de `pos-app` en la lista. Haz clic en **"Import"**.

### 3. Configurar Variables de Entorno (¡IMPORTANTE!)
En la pantalla de configuración del proyecto ("Configure Project"), busca la sección **"Environment Variables"**.
Tienes que agregar las 4 variables que tienes en tu archivo `.env.local`. Copia y pega una por una:

| Name (Nombre) | Value (Valor) |
| :--- | :--- |
| `GOOGLE_CLIENT_ID` | *(Copia el valor de tu .env.local)* |
| `GOOGLE_CLIENT_SECRET` | *(Copia el valor de tu .env.local)* |
| `GOOGLE_REFRESH_TOKEN` | *(Copia el valor de tu .env.local)* |
| `GOOGLE_SHEET_ID` | *(Copia el valor de tu .env.local)* |

*Dale clic a "Add" después de poner cada par nombre/valor.*

### 4. Desplegar
1.  Haz clic en el botón **"Deploy"**.
2.  Espera unos segundos/minutos. Vercel construirá tu aplicación.
3.  ¡Listo! Verás una pantalla con cohetes.
4.  Haz clic en la imagen de tu web o en el botón **"Visit"**.

**Esa URL (ejemplo: `pos-app-tu-nombre.vercel.app`) es la que le darás a tus clientes.**
Tiene HTTPS automático, así que la cámara funcionará perfectamente.

---

## Solución de Problemas Comunes

### Error 500 al abrir la app
Si al abrir la app ves un error, probablemente las variables de entorno no se copiaron bien.
1. Ve a tu proyecto en Vercel > **Settings** > **Environment Variables**.
2. Verifica que estén las 4 y que los valores sean idénticos a tu `.env.local`.
3. Si cambias algo, tienes que ir a la pestaña **Deployments** y darle a "Redeploy" en los 3 puntitos del último despliegue.

### La cámara no abre
Asegúrate de haber dado permisos de cámara en el navegador del celular.
