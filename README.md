# El Último Almacén

Supervivencia en primera persona o con vista de arriba. Una bruma levantó a los muertos y a los dinosaurios, y vos tenés el último almacén abierto de la ruta. De día salís a saquear un pueblo entero mueble por mueble, cazar, talar y cumplir encargos. De noche defendés la empalizada de las hordas.

Estado: **acceso anticipado (prototipo)**, versión 0.2.0.

## Novedades de la 0.2

- Pueblo al sur con supermercado, farmacia, ferretería, armería, estación de servicio y casas. Cada heladera, alacena, armario o baúl de auto se revisa por separado.
- Salud por heridas (rasguño, corte, mordida), sangrado, infección de la bruma, intoxicación, cansancio, pánico y mojarse con la lluvia.
- Peso en kilos, mochilas que se encuentran, comida que se pudre, clima cambiante y cama para dormir.
- 13 armas (8 cuerpo a cuerpo con desgaste y 5 de fuego) y 6 habilidades que suben con el uso.
- Menú principal, nueva partida con dificultades y reglas del mundo a medida, y opciones de pantalla, sonido, controles e idioma.
- 12 idiomas: español, inglés, portugués, francés, alemán, italiano, ruso, polaco, turco, chino, japonés y coreano.

## Controles

WASD moverse · Shift correr · C agacharse · Espacio saltar · Clic disparar o pegar · Clic derecho apuntar · R recargar · 1-9 armas (Q la anterior) · E usar o revisar · G cargar nafta · Tab inventario, salud y habilidades · M mapa · X comer o tomar · H vendar · B construir · L linterna · T órdenes al raptor · **V cambiar entre primera persona y vista de arriba** · F11 pantalla completa · Esc pausa.

## Qué hay en este repositorio

| Carpeta / archivo | Para qué sirve |
| --- | --- |
| `game/index.html` | El juego completo. Se abre también en cualquier navegador. |
| `game/vendor/three.min.js` | Motor 3D (three.js r128, licencia MIT) incluido para que funcione sin internet. |
| `main.js` | La ventana de escritorio (Electron). Arranca en pantalla completa; F11 la alterna. |
| `build/icon.png` | Ícono provisorio de la aplicación. |
| `.github/workflows/build-windows.yml` | Compila el juego para Windows automáticamente en GitHub. |

## Cómo conseguir el .exe

Cada vez que se sube un cambio a `main`, GitHub compila el juego solo:

1. Entrá a la pestaña **Actions** del repositorio.
2. Abrí la última ejecución de **Compilar para Windows** (tarda unos 5 minutos).
3. Abajo, en **Artifacts**, descargá `ElUltimoAlmacen-windows`. Adentro hay:
   - `ElUltimoAlmacen-0.1.0-portable.exe`: se abre con doble clic, no hace falta instalar.
   - `ElUltimoAlmacen-0.1.0-steam.zip`: la carpeta del juego descomprimida, que es lo que se sube a Steam.

Para publicar una versión numerada, se crea un tag (por ejemplo `v0.2.0`) y el workflow la adjunta en **Releases**.

## Probarlo en la compu sin compilar

Con [Node.js](https://nodejs.org) instalado:

```
npm install
npm start
```

## Camino a Steam (acceso anticipado)

1. **Cuenta de Steamworks** en partner.steamgames.com: datos personales, cuenta bancaria y formulario de impuestos. Si sos menor de edad, la abre un adulto a su nombre.
2. **Pagar Steam Direct** (US$100 por juego, se devuelven cuando el juego factura US$1.000). Desde el pago hay que esperar 30 días para poder lanzar.
3. **Página de la tienda**: nombre, descripción, capturas, tráiler, cápsulas (imágenes de portada en los tamaños que pide Steam) y el texto de acceso anticipado: qué tiene hoy, qué falta y cuánto tiempo se planea estar en acceso anticipado. Tiene que estar visible como "Próximamente" al menos 2 semanas antes del lanzamiento.
4. **Contenido generado con IA**: en el cuestionario de contenido hay que declarar que el juego se desarrolló con ayuda de IA.
5. **Subir el juego** con SteamPipe (la herramienta de Steamworks): se sube el contenido de `ElUltimoAlmacen-x.y.z-steam.zip` descomprimido, con `El Ultimo Almacen.exe` como ejecutable de inicio.
6. **Revisión de Valve** de la página y del build (unos días). Después se lanza, y cada actualización es subir un build nuevo y pasarlo a la rama pública.

## Pendientes antes de pagar Steam Direct

- Jugarlo varias semanas y ajustar la dificultad y el ritmo.
- Mejorar modelos, animaciones y sonidos (hoy son provisorios).
- Soporte de joystick y teclas configurables.
- Integración con Steam (logros, guardado en la nube) usando steamworks.js.
- Ícono y cápsulas definitivas.
