-- =============================================================================
-- Esquema de la base de datos (SQLite).
-- Se ejecuta entero cada arranque: todas las sentencias son idempotentes.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- jugadores: una fila por nombre distinto que haya terminado una partida.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jugadores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT    NOT NULL UNIQUE,
  creado_en  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- partidas: una fila por partida terminada.
-- La puntuación NO la manda el cliente: la calcula el servicio del servidor,
-- para que nadie pueda inflarla desde la consola del navegador.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partidas (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  jugador_id        INTEGER NOT NULL,
  gano              INTEGER NOT NULL CHECK (gano IN (0, 1)),
  cadena_maxima     INTEGER NOT NULL DEFAULT 0 CHECK (cadena_maxima IN (0, 1)),
  dificultad        TEXT    NOT NULL CHECK (dificultad IN ('facil', 'normal', 'dificil')),
  rondas            INTEGER NOT NULL CHECK (rondas >= 0),
  dano_hecho        INTEGER NOT NULL DEFAULT 0 CHECK (dano_hecho >= 0),
  dano_recibido     INTEGER NOT NULL DEFAULT 0 CHECK (dano_recibido >= 0),
  mejor_cadena      INTEGER NOT NULL DEFAULT 0 CHECK (mejor_cadena >= 0),
  sellos            INTEGER NOT NULL DEFAULT 0 CHECK (sellos >= 0),
  duelos_ganados    INTEGER NOT NULL DEFAULT 0 CHECK (duelos_ganados >= 0),
  duelos_perdidos   INTEGER NOT NULL DEFAULT 0 CHECK (duelos_perdidos >= 0),
  poderes_usados    INTEGER NOT NULL DEFAULT 0 CHECK (poderes_usados >= 0),
  puntuacion        INTEGER NOT NULL DEFAULT 0,
  jugada_en         TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (jugador_id) REFERENCES jugadores (id) ON DELETE CASCADE
);

-- Índices para las dos consultas que más se repiten:
-- el historial de un jugador y la tabla de puntuaciones.
CREATE INDEX IF NOT EXISTS idx_partidas_jugador
  ON partidas (jugador_id);

CREATE INDEX IF NOT EXISTS idx_partidas_puntuacion
  ON partidas (puntuacion DESC);
