# Guion de defensa

Preguntas que es muy probable que caigan el día de la presentación, ordenadas
de más a menos probable, con la respuesta corta y el archivo donde se enseña.

**Regla de oro:** la nota es individual. Los dos tenéis que poder abrir
cualquier archivo y explicarlo. Repartid la exposición, pero estudiad el
proyecto entero.

---

## A. Arquitectura

### «Enséñame dónde está la lógica del juego y dónde el dibujo.»

> La lógica está en `modules/` y `entities/`, y el dibujo en `render/`. La
> frontera se puede comprobar en un segundo: en `modules/` y `entities/` no
> aparece **ni un `document`**, y en `render/` no aparece **ni un `if` sobre
> quién gana**.

Demostración en vivo, en la terminal:

```bash
grep -r "document\." frontend/src/js/modules frontend/src/js/entities
# no devuelve nada
```

### «¿Cómo se comunican entonces?»

> Con un objeto que llamamos **parte de ronda**. `resolverRonda()` recibe la
> jugada, cambia el estado y devuelve qué ha pasado: quién ganó, cuánto daño,
> qué nivel de cadena, qué carteles hay que enseñar. La escena lee ese parte y
> lo escenifica.

Abrir `modules/motor-ronda.js`, señalar `parteVacio()` y la función
`resolverRonda` al final.

### «Demuéstrame que la lógica funciona sin la interfaz.»

Abrir la consola del navegador (F12):

```js
JUEGO.forzarTiradaIa(() => "tijera")   // la IA juega siempre lo que pierde
JUEGO.partida.cadena.jugador           // ver la cadena
JUEGO.regalarPoder("pistola")
JUEGO.llenarCarga()
```

Y el guion determinista que provoca una CADENA MÁXIMA (con la IA forzada a
perder): `papel, papel, tijera, tijera, piedra, piedra`.

### «¿Por qué tantos archivos?»

> Porque el enunciado prohíbe pasar de 300 líneas por archivo y porque cada uno
> tiene un trabajo. Si mañana hay que cambiar el ritmo de las animaciones, se
> toca `escenificar-ronda.js` y no se puede romper ninguna regla del juego,
> porque las reglas no están ahí.

---

## B. Decisiones de diseño (aquí es donde se sube nota)

### «¿Por qué el nivel de cadena no está guardado en una variable?»

> Porque guardamos **hechos** y derivamos **conclusiones**. La clase `Cadena`
> solo guarda la lista de tiradas ganadoras; el nivel se calcula cada vez que
> se pide.
>
> Si guardáramos una propiedad `nivel`, habría que acordarse de actualizarla en
> todos los sitios donde la cadena cambia. Olvidarlo en uno solo daría una
> insignia que dice x3 mientras el daño real es x2. Calculándolo, es
> **imposible** que se contradigan.

`entities/cadena.js`, métodos `nivel()` y `longitudSubRacha()`.

### «¿Por qué el daño base es 1 y no proporcional a la vida?»

> Es deliberado. Si el daño creciera con la vida, subir la vida no alargaría la
> partida: harían falta los mismos golpes. Con daño fijo, más vida es de verdad
> más rondas.

### «Después de cinco empates prohibís una tirada. ¿Por qué distinta a cada uno?»

> Porque si les quitáramos la misma a los dos, ambos se quedarían con las
> mismas dos cartas y la probabilidad de empate subiría a **1/2** — justo lo
> contrario de lo que queremos. Con vetos cruzados baja a **1/4**.

`modules/eventos-de-ronda.js`, función `repartirBloqueos`.

### «El bloqueo dura 2 rondas pero solo se aplica en una. ¿Error?»

> No, es el orden de los pasos. El bloqueo se reparte **durante** la ronda que
> lo provoca, y al terminar esa ronda el motor descuenta uno a todos los vetos.
> Si lo pusiéramos en 1, se quedaría en 0 antes de llegar a aplicarse nunca.
> Está comentado en el propio archivo.

### «La pistola gana a las tres tiradas. ¿No está desequilibrada?»

> Lo estaba. Por eso no viene sola: en el momento en que un bando la activa, el
> otro recibe un **ESCUDO**, que solo sirve para pararla y pierde contra piedra,
> papel y tijera.
>
> Eso la convierte en un pulso. Si disparas y el rival escudó, pierdes la ronda
> y la bala. Si el rival escuda y tú no disparaste, pierde él y se queda sin
> escudo. Las dos cartas se gastan al jugarse.

Enseñarlo en vivo desde la consola:

```js
JUEGO.regalarPoder("pistola")
// activarla desde la mochila y mirar la mochila de la IA: aparece el escudo
JUEGO.partida.mochila.ia.estaActivo("escudo")   // true
```

### «¿Y no se quedan los dos esperando para siempre?»

> No, por una regla concreta: cuando la pistola se dispara, el escudo se retira
> automáticamente, porque ya no hay nada que parar. Sin esa limpieza sí habría
> bloqueo: al que tiene la pistola le bastaría con no disparar nunca para que el
> escudo del rival fuera inútil, y el escudo se quedaría puesto eternamente.

`modules/efectos-poderes.js`, función `limpiarEscudosSinAmenaza`.

### «¿Cómo comparáis cinco tiradas sin llenar el código de `if`?»

> Con una tabla completa de a quién vence cada una. Cumple una invariante: para
> cualquier par de tiradas distintas, exactamente una aparece en la lista de la
> otra. Así `comparar` son tres líneas y no hay ni un caso especial, ni para la
> pistola ni para el escudo.

Abrir `modules/reglas-tiradas.js` y enseñar `VENCE_A` y `comparar` juntos.

### «¿Por qué el escudo no sale como premio del Wordle?»

> Porque no es un premio, es una respuesta. Si tocara en un sorteo, saldría sin
> ninguna pistola que parar: una carta que solo sabe perder. En el catálogo va
> marcado con `esConcedido: true`, y `IDS_SORTEABLES` filtra por esa marca.

### «¿Por qué el martillo suma al final y no antes?»

> Porque si se sumara antes también se multiplicaría. Un +3 se convertiría en
> +9 con una triple cadena y el poder sería incontrolable. Sumándolo después,
> vale siempre lo mismo y es fácil de explicar al jugador.

`modules/calculo-dano.js`. La fórmula está escrita en la cabecera del archivo.

### «¿Por qué el CSS de los efectos ya no se inyecta desde JavaScript?»

> Porque el enunciado prohíbe los estilos dentro del HTML y del JS. En la
> versión anterior el objeto de efectos se montaba solo e inyectaba su propio
> `<style>`; ahora ese CSS vive en `css/efectos.css`, que además permite
> retocar el jugo visual sin abrir el JavaScript.

### «Habéis conectado ChatGPT. ¿Dónde está la clave?»

> En `backend/.env`, y en ningún otro sitio. El enunciado lo prohíbe
> expresamente en el código fuente, y además ponerla en el frontend sería
> publicarla: el JavaScript de una página lo lee cualquiera con F12. El
> navegador le pide las cosas a `/api/mente` y es el proceso de Node el que
> llama al proveedor con la credencial.
>
> Y si quiere comprobarlo: `grep -ri "sk-" frontend/` no devuelve nada, y el
> único archivo de todo el proyecto que llama a una IA externa es
> `backend/src/services/cliente-modelo.js`.

### «Si el modelo tarda dos segundos, ¿la partida se queda colgada?»

> No, porque no se le pregunta cuando hace falta la respuesta: **se le pregunta
> antes**. En cuanto la mesa queda lista para tu jugada se le pide su tirada, y
> cuando eliges carta o ya está contestada o ya no se usa. El rival piensa
> mientras tú piensas.
>
> Medido: 999 ms de ronda con el modelo conectado, lo mismo que sin él. Y si
> tarda más de seis segundos o no hay internet, juega con la estrategia difícil
> y no se nota.

### «¿Y si el modelo contesta cualquier cosa?»

> Se valida antes de usarla. Lo que devuelve un modelo es texto libre: si
> contestara «lagarto», la ronda se quedaría sin carta que jugar. En
> `OponenteIA.elegirTirada` se comprueba que sea una de las tres tiradas y que
> no esté vetada; si no, manda la estrategia de siempre.

### «¿Vuestro chatbot funciona sin la API?»

> Sí, y es a propósito. Tiene dos cerebros: con modelo contesta el modelo, sin
> modelo contesta una tabla de respuestas emparejadas por palabras clave
> (`modules/faq-juego.js`). Un chatbot que solo arranca si alguien paga una API
> no explica nada el día que se corrige el proyecto sin clave.

### «Nueve poderes, nueve animaciones. ¿Nueve funciones?»

> No: una función y nueve bloques de CSS. El catálogo de poderes tiene un campo
> `gesto` —`"disparo"`, `"impacto"`, `"cerrojo"`…— y el renderizador se limita
> a poner esa clase en la capa. Inventar un poder con animación propia es una
> entrada en el catálogo y un bloque de CSS, sin tocar el renderizador. El
> sonido igual: el sintetizador tiene una melodía con el nombre del gesto.

### «¿Por qué el avatar no está en el HTML?»

> Porque no es esqueleto de la página: nace al empezar una partida y muere al
> salir de ella. La regla que seguimos es que lo fijo va en el HTML y lo que
> aparece y desaparece se construye desde JavaScript, igual que las capas de
> efectos o las fichas de las mochilas. Que `index.html` fuera justo de líneas
> ayudó a decidirlo, pero la razón es esa.

---

## C. Trampas de JavaScript

### «¿Por qué no usáis `parseInt(texto) || 20`?»

> Porque en JavaScript **el 0 es falsy**. `parseInt("0") || 20` devuelve 20, no
> 0. Nos pasó de verdad: la configuración decía 20 mientras la pantalla enseñaba
> un 0. Por eso comprobamos `Number.isNaN` explícitamente.

`utils/numeros.js`, función `leerEntero`.

### «¿Por qué leéis `offsetWidth` sin usar el valor?»

> Para reiniciar una animación CSS. Quitar y volver a poner la clase en la misma
> línea no cuenta como cambio: el navegador lo agrupa todo. Leer `offsetWidth`
> le obliga a recalcular el diseño en ese instante, así que sí ve los dos
> estados y la animación se repite.

`utils/dom.js`, función `reiniciarAnimacion`.

### «¿Por qué zoom y sacudida están en una sola animación?»

> Porque las dos usan `transform`, y en CSS dos animaciones peleándose por la
> misma propiedad se pisan: gana una y la otra no se ve. Al fusionarlas en un
> único `@keyframes`, se ven las dos.

`css/efectos.css`, `@keyframes golpe` y `golpe-fuerte`.

### «¿Cómo manejáis las letras repetidas en el Wordle?»

> Contando. Si la palabra es MANGO y el jugador escribe MAMMA, solo la primera
> M puede marcarse: solo hay una M. Contamos cuántas veces aparece cada letra
> de la palabra secreta y **consumimos** una aparición en cada acierto. Dos
> pasadas: primero las que están en su sitio exacto, después las que están en
> otra posición.

`modules/logica-wordle.js`. Probarlo en vivo escribiendo una palabra con letras
repetidas.

### «¿Y las tildes y la Ñ?»

> Comparamos siempre una versión normalizada: mayúsculas y sin tildes. El
> detalle fino es la Ñ: la descomposición Unicode también le separaría la
> virgulilla y la convertiría en N, así que la apartamos con un marcador antes
> de normalizar y la devolvemos después.

`utils/texto.js`, función `normalizar`.

### «¿Por qué `requestAnimationFrame` y no `setInterval` para el reloj?»

> Porque el navegador frena los intervalos de las pestañas en segundo plano.
> Con `setInterval`, cambiar de pestaña le regalaría segundos al jugador. Con
> `requestAnimationFrame` calculamos el tiempo restante contra el reloj real.

`core/reloj.js`.

---

## D. Backend

### «Enséñame que la ruta no consulta la base de datos.»

Abrir `routes/rutas-partidas.js`: son seis líneas y solo dicen qué verbo va con
qué controlador. Luego `controllers/controlador-partidas.js`: llama al servicio
y responde. Luego `services/servicio-partidas.js`: las reglas. Luego
`repositories/repositorio-partidas.js`: el SQL.

> Ninguna capa se salta a la siguiente. El servicio no toca `req` ni `res`: si
> algo va mal lanza un `ErrorHttp` y el middleware de errores lo traduce.

### «¿Dónde está la protección contra inyección SQL?»

> En que **todas** las consultas van parametrizadas con `?` y ninguna concatena
> texto. `WHERE id = ?` con el valor aparte: el motor trata el dato como dato y
> nunca como SQL.

Demostración: buscar una concatenación y no encontrarla.

### «¿Por qué la puntuación la calcula el servidor?»

> Porque si la mandara el cliente, cualquiera podría abrir la consola y escribir
> 999999 para encabezar la tabla. El cliente manda **hechos** (rondas, daño,
> duelos ganados) y el servidor deduce el número.

`services/servicio-puntuacion.js`.

### «Enséñame los códigos de estado.»

Con el backend levantado:

```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/jugadores          # 200
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/jugadores \
     -H "Content-Type: application/json" -d '{"nombre":"Pana"}'                # 201
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/jugadores/abc      # 400
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE localhost:3000/api/jugadores/1  # 401
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/jugadores/9999     # 404
```

### «¿Por qué hay un middleware para el 404?»

> Sin él, una URL desconocida devolvería la página HTML por defecto de Express,
> y el frontend recibiría HTML donde espera JSON. El middleware convierte
> cualquier ruta inexistente en un 404 con el mismo formato que el resto.

---

## E. Preguntas incómodas (prepararlas)

### «¿Esto lo habéis hecho vosotros?»

Responder con lo que solo sabe quien lo ha hecho: los bugs. Dos buenos:

> **Uno.** La ventana de configuración se quedaba abierta encima de la partida y
> se tragaba los clics del botón del duelo. El botón estaba habilitado, el
> controlador existía, pero el clic nunca llegaba: lo recibía el campo de vida
> que había justo debajo del cursor. Se arregló cerrando las ventanas del menú
> al salir de la escena del menú.

> **Dos.** La IA ganaba poderes en los duelos y no los usaba nunca. La función
> que decidía si activar uno estaba escrita, pero no la llamaba nadie: el motor
> solo miraba si el poder ya estaba activo. Al conectarla hubo que decidir
> *cuándo* llamarla, y la respuesta no era obvia: al final de la ronda, no al
> principio. Si la IA sacara la pistola al empezar, el jugador ya habría elegido
> su carta y no tendría ninguna forma de reaccionar.

### «¿Cuál es la parte más débil del proyecto?»

> La autenticación. La clave de la API es una clave compartida: justifica el 401
> y protege el borrado, pero no es un sistema de usuarios. Para producción
> haría falta contraseñas cifradas y tokens.

(Responder con una debilidad real da más credibilidad que decir «ninguna».)

### «¿Qué pasa si se cae el backend en mitad de la demo?»

> Nada: el juego funciona igual. La tabla de puntuaciones y el guardado son un
> extra. Si el servidor no responde, la pantalla de fin lo dice y la partida
> sigue siendo jugable. Se puede demostrar apagando el servidor en vivo.

### «¿Por qué SQLite y no PostgreSQL?»

> Cero configuración y funciona sin internet el día de la presentación. La
> pega es que en Render el disco es efímero sin un volumen persistente. Como
> todo el SQL está en `repositories/`, cambiar de motor se limita a esa carpeta.

### «¿Por qué el SQLite de Node y no una librería como better-sqlite3?»

> Porque la usábamos y nos rompía la portabilidad. `better-sqlite3` es un
> módulo nativo: si no hay binario ya hecho para tu versión de Node, npm lo
> compila, y para eso hace falta Visual Studio. Con Node 24 pasaba justo eso,
> así que en un PC sin herramientas de compilación el backend no se instalaba.
> `node:sqlite` viene dentro de Node desde la 22: nada que compilar ni que
> descargar. La API es casi la misma (`prepare`, `get`, `all`, `run`), así que
> el cambio fue un solo archivo, `config/base-datos.js`.

### «¿Qué añadiríais si tuvierais más tiempo?»

> Dos jugadores locales, guardado de partida a medias y una suite de pruebas
> integrada en el repositorio.

---

## F. Plan de demostración en vivo (5 minutos)

1. **Menú** — enseñar la configuración: nombre, vida, **carga para el duelo** y
   dificultad. Explicar que el jugador decide cada cuántos puntos de daño se
   desbloquea el Wordle.
2. **Dos o tres rondas** — que salga una doble cadena y un sello. Señalar la
   insignia, los huecos de sellos y el círculo llenándose.
3. **Duelo** — abrirlo, fallar un intento a propósito para que se vean los
   colores y el teclado marcándose, y ganar. Elegir **PISTOLA**.
4. **Usar la pistola** — activarla desde la mochila, enseñar que aparece la
   cuarta carta y ganarle a lo que sea.
5. **Perder un duelo a propósito** — para que se oiga la risa del rival y se vea
   la bonificación pasando a la mochila de la IA.
6. **El ayudante** — abrir el botón `?` y preguntarle algo. Si hay clave
   configurada contesta el modelo; si no, contesta la tabla. Decirlo en voz
   alta: funciona de las dos maneras.
7. **EL GENIO** (solo si está conectada) — una ronda con la cuarta dificultad,
   señalando que el comentario del avatar lo acaba de escribir el modelo para
   esa jugada concreta, y que la ronda no ha tardado más que las anteriores.
8. **Terminar la partida** y enseñar la tarjeta final con la puntuación que ha
   calculado el servidor, y después la tabla de puntuaciones.

Si algo falla, abrir la consola: no hay errores, y eso también es un argumento.
