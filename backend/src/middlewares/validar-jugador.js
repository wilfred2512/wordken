/**
 * Validación de entrada de los endpoints de jugadores.
 *
 * Se valida en el servidor aunque el formulario del navegador ya valide:
 * el cliente se puede saltar con curl, el servidor no.
 */
import { validarNombre, validarIdentificador } from "../utils/validaciones.js";
import { errorPeticionInvalida } from "../utils/error-http.js";

/** Comprueba el cuerpo de POST y PUT /api/jugadores. */
export function validarCuerpoDeJugador(req, _res, siguiente) {
  const problemas = [];
  const problemaNombre = validarNombre(req.body?.nombre);

  if (problemaNombre) problemas.push(problemaNombre);

  if (problemas.length > 0) {
    return siguiente(errorPeticionInvalida("Los datos del jugador no son válidos.", problemas));
  }

  return siguiente();
}

/**
 * Comprueba que :id sea un entero positivo y lo deja ya convertido
 * en req.identificador, para que el controlador no repita el parseInt.
 */
export function validarIdDeRuta(req, _res, siguiente) {
  const identificador = validarIdentificador(req.params.id);

  if (identificador === null) {
    return siguiente(
      errorPeticionInvalida("El identificador de la URL debe ser un entero positivo.", [
        { campo: "id", mensaje: `Valor recibido: "${req.params.id}".` },
      ]),
    );
  }

  req.identificador = identificador;
  return siguiente();
}
