# El Último Almacén

Supervivencia en primera persona. Una bruma levantó a los muertos y a los dinosaurios, y vos tenés el último almacén abierto de la ruta. De día salís a saquear un pueblo entero mueble por mueble, cazar, talar y cumplir encargos. De noche defendés la empalizada de las hordas.

Estado: **acceso anticipado (prototipo)**, versión 0.6.0.

## Novedades de la 0.6

- Historia tranquila y no lineal: cuatro relatos (los Ibarra, la Piedra Verde, la caravana y la voz de la radio) que se arman solos según dónde vayas y con quién hables. Se leen en el Diario (J).
- Nueve lugares nuevos en el mapa: dos pueblos (Paso del Sauce y Colonia Esperanza), la estación de tren, la estancia La Paloma, la antena del Cerro Chato, el campamento del arroyo, la terminal de ómnibus, el mirador y el cementerio de la loma. Los pueblos son zonas seguras.
- Siete personajes con los que hablar, comprarles y venderles cosas especiales, pedir servicios (curarte, arreglar un auto, llenar el tanque, marcar lugares en el mapa) y hacerles favores.
- Cuatro vehículos nuevos: auto familiar, todoterreno 4x4, ambulancia y un colectivo roto que se puede arreglar con un kit de motor.
- La carga de los vehículos ahora se abre: acercate por atrás y apretá E para guardar o sacar cosas.
- Animaciones nuevas: los podridos arrastran los pies, corren moviendo los brazos y se preparan antes de pegar; los dinosaurios mueven la cola y la cabeza y el rex hace temblar el piso; los enemigos caen distinto al morir. En primera persona el arma se balancea, se recarga por pasos y los golpes tienen impulso.
- Radio portátil: a las 23 se escucha la transmisión desde la costa.

## Novedades de la 0.5

- El juego queda solo en primera persona: se quitó la vista de arriba.
- Armas nuevas por dentro y por fuera: cada una tiene miras, cargador, rieles, madera con veta y metal con brillo, y se ven las manos con guantes y las mangas. Al disparar salta el casquillo y sale humo del caño.
- Cielo con nubes que se mueven, sol y estrellas de noche.
- Pasto que se mueve con el viento y cambia de color con la estación, flores en primavera y verano, piedras por todo el mapa y basura en el pueblo y la ruta (cubiertas, tambores, cajones, bolsas, conos y postes caídos).
- Enemigos con más detalle: bocas con dientes, ropa rota, costillas a la vista, sangre, pelo, manos y zapatos; los dinosaurios tienen garras, púas, fosas nasales y crestas.
- Aunque hay más detalle, en el pueblo se dibujan menos objetos por cuadro que en la 0.4 (de unos 640 a unos 490).

## Novedades de la 0.4

- Mapa fijo: todas las partidas nuevas usan el mismo mundo, así podés aprenderte el terreno. Para jugar en otro mapa, escribí cualquier palabra en "Mapa distinto" al crear la partida. Las partidas guardadas conservan su mapa.
- Rendimiento: el mundo y los enemigos se dibujan en bloques, con entre 2 y 5 veces menos objetos por cuadro según la zona.
- Texturas dibujadas por el juego para pasto, revoque, madera, ladrillo, chapa y hojas.
- Sonido nuevo: disparos en capas con eco al aire libre, sonido estéreo según de dónde viene, pasos distintos en pasto, ruta, madera, nieve y agua, pájaros de día y grillos y aullidos de noche.

## Novedades de la 0.3

- 12 enemigos comunes: 6 podridos (caminante, corredor, bruto, gritón, hinchado que explota, soldado con chaleco) y 6 dinosaurios (raptor, raptor pálido, cornudo, saltador, escupidor de ácido, acorazado).
- 6 minijefes, cada uno en su zona peligrosa del mapa (puesto militar, frigorífico, hospital, cañadón, salina y laguna). Sueltan un trofeo y su zona queda tranquila tres días.
- 2 jefes que se invocan en la Piedra Verde con trofeos y lo que sueltan los enemigos comunes: el Coloso de la Bruma (podridos) y el Rex Podrido (dinos).
- Calendario real: la partida empieza el 9 de noviembre y cada día de juego avanza un día. Estaciones del hemisferio sur (primavera el 21 de septiembre, verano el 21 de diciembre, otoño el 21 de marzo, invierno el 21 de junio) con temperatura, frío, calor, nieve y vegetación que cambia.
- Vehículos de carga: además de la camioneta hay un furgón (180 kg), un camión (420 kg) y un tractor con acoplado (300 kg). El camión y el tractor aparecen rotos y se arreglan con herramientas y chatarra.
- 7 armas nuevas: ballesta, escopeta de combate, rifle de francotirador, ametralladora, lanzagranadas, katana y mazo. Campera de abrigo para el invierno.

## Novedades de la 0.2

- Pueblo al sur con supermercado, farmacia, ferretería, armería, estación de servicio y casas. Cada heladera, alacena, armario o baúl de auto se revisa por separado.
- Salud por heridas (rasguño, corte, mordida), sangrado, infección de la bruma, intoxicación, cansancio, pánico y mojarse con la lluvia.
- Peso en kilos, mochilas que se encuentran, comida que se pudre, clima cambiante y cama para dormir.
- 13 armas (8 cuerpo a cuerpo con desgaste y 5 de fuego) y 6 habilidades que suben con el uso.
- Menú principal, nueva partida con dificultades y reglas del mundo a medida, y opciones de pantalla, sonido, controles e idioma.
- 12 idiomas: español, inglés, portugués, francés, alemán, italiano, ruso, polaco, turco, chino, japonés y coreano.

## Controles

WASD moverse · Shift correr · C agacharse · Espacio saltar · Clic disparar o pegar · Clic derecho apuntar · R recargar · 1-9 o rueda del mouse armas (Q la anterior) · E usar, revisar o reparar · G cargar nafta · Tab inventario, salud y habilidades · M mapa · J diario · X comer o tomar · H vendar · B construir · L linterna · T órdenes al raptor · F11 pantalla completa · Esc pausa.

## Qué hay en este repositorio

| Carpeta / archivo | Para qué sirve |
| --- | --- |
| `game/index.html` | El juego completo. Se abre también en cualquier navegador. |
| `game/vendor/three.min.js` | Motor 3D (three.js r128, licencia MIT) incluido para que funcione sin internet. |
| `main.js` | La ventana de escritorio (Electron). Arranca en pantalla completa; F11 la alterna. |
| `build/icon.png` | Ícono provisorio de la aplicación. |
| `.github/workflows/build-windows.yml` | Compila el juego para Windows automáticamente en GitHub. |

## Cómo conseguir el .exe

Cada vez que se sube un cambio a `main`, GitHub compila el juego solo (tarda unos 5 minutos) y lo publica en **Releases** con el número de versión de `package.json`. La última siempre está en [Releases → Latest](https://github.com/santiagodibella2020/El-Ultimo-Almacen/releases/latest), sin iniciar sesión:

- `ElUltimoAlmacen-<versión>-portable.exe`: se abre con doble clic, no hace falta instalar.
- `ElUltimoAlmacen-<versión>-steam.zip`: la carpeta del juego descomprimida, que es lo que se sube a Steam.

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
