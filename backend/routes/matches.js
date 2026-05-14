const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");

// Todos los horarios en ET (UTC-4). "00:00" bajo un día = medianoche pasando al día siguiente.
// homeCode/awayCode = ISO-2 para banderas. EN=Inglaterra, SC=Escocia (casos especiales).
// homeTla/awayTla   = código FIFA de 3 letras para sincronización con football-data.org.

const MATCHES = [
  // ── GRUPO A: México · Sudáfrica · Corea del Sur · Rep. Checa ──────────────
  { id:  1, home: "México",        homeCode: "MX", homeTla: "MEX", away: "Sudáfrica",      awayCode: "ZA", awayTla: "RSA", date: "2026-06-11T15:00:00-04:00", group: "Grupo A" },
  { id:  2, home: "Corea del Sur", homeCode: "KR", homeTla: "KOR", away: "Rep. Checa",      awayCode: "CZ", awayTla: "CZE", date: "2026-06-11T22:00:00-04:00", group: "Grupo A" },
  { id:  3, home: "Rep. Checa",    homeCode: "CZ", homeTla: "CZE", away: "Sudáfrica",       awayCode: "ZA", awayTla: "RSA", date: "2026-06-18T12:00:00-04:00", group: "Grupo A" },
  { id:  4, home: "México",        homeCode: "MX", homeTla: "MEX", away: "Corea del Sur",   awayCode: "KR", awayTla: "KOR", date: "2026-06-18T21:00:00-04:00", group: "Grupo A" },
  { id:  5, home: "Rep. Checa",    homeCode: "CZ", homeTla: "CZE", away: "México",          awayCode: "MX", awayTla: "MEX", date: "2026-06-24T21:00:00-04:00", group: "Grupo A" },
  { id:  6, home: "Sudáfrica",     homeCode: "ZA", homeTla: "RSA", away: "Corea del Sur",   awayCode: "KR", awayTla: "KOR", date: "2026-06-24T21:00:00-04:00", group: "Grupo A" },

  // ── GRUPO B: Canadá · Bosnia y Herz. · Catar · Suiza ─────────────────────
  { id:  7, home: "Canadá",        homeCode: "CA", homeTla: "CAN", away: "Bosnia y Herz.",  awayCode: "BA", awayTla: "BIH", date: "2026-06-12T15:00:00-04:00", group: "Grupo B" },
  { id:  8, home: "Catar",         homeCode: "QA", homeTla: "QAT", away: "Suiza",           awayCode: "CH", awayTla: "SUI", date: "2026-06-13T15:00:00-04:00", group: "Grupo B" },
  { id:  9, home: "Suiza",         homeCode: "CH", homeTla: "SUI", away: "Bosnia y Herz.",  awayCode: "BA", awayTla: "BIH", date: "2026-06-18T15:00:00-04:00", group: "Grupo B" },
  { id: 10, home: "Canadá",        homeCode: "CA", homeTla: "CAN", away: "Catar",           awayCode: "QA", awayTla: "QAT", date: "2026-06-18T18:00:00-04:00", group: "Grupo B" },
  { id: 11, home: "Suiza",         homeCode: "CH", homeTla: "SUI", away: "Canadá",          awayCode: "CA", awayTla: "CAN", date: "2026-06-24T15:00:00-04:00", group: "Grupo B" },
  { id: 12, home: "Bosnia y Herz.",homeCode: "BA", homeTla: "BIH", away: "Catar",           awayCode: "QA", awayTla: "QAT", date: "2026-06-24T15:00:00-04:00", group: "Grupo B" },

  // ── GRUPO C: Brasil · Marruecos · Haití · Escocia ─────────────────────────
  { id: 13, home: "Brasil",        homeCode: "BR", homeTla: "BRA", away: "Marruecos",       awayCode: "MA", awayTla: "MAR", date: "2026-06-13T18:00:00-04:00", group: "Grupo C" },
  { id: 14, home: "Haití",         homeCode: "HT", homeTla: "HAI", away: "Escocia",         awayCode: "SC", awayTla: "SCO", date: "2026-06-13T21:00:00-04:00", group: "Grupo C" },
  { id: 15, home: "Escocia",       homeCode: "SC", homeTla: "SCO", away: "Marruecos",       awayCode: "MA", awayTla: "MAR", date: "2026-06-19T18:00:00-04:00", group: "Grupo C" },
  { id: 16, home: "Brasil",        homeCode: "BR", homeTla: "BRA", away: "Haití",           awayCode: "HT", awayTla: "HAI", date: "2026-06-19T21:00:00-04:00", group: "Grupo C" },
  { id: 17, home: "Escocia",       homeCode: "SC", homeTla: "SCO", away: "Brasil",          awayCode: "BR", awayTla: "BRA", date: "2026-06-24T18:00:00-04:00", group: "Grupo C" },
  { id: 18, home: "Marruecos",     homeCode: "MA", homeTla: "MAR", away: "Haití",           awayCode: "HT", awayTla: "HAI", date: "2026-06-24T18:00:00-04:00", group: "Grupo C" },

  // ── GRUPO D: EEUU · Paraguay · Australia · Turquía ────────────────────────
  { id: 19, home: "EEUU",          homeCode: "US", homeTla: "USA", away: "Paraguay",        awayCode: "PY", awayTla: "PAR", date: "2026-06-12T21:00:00-04:00", group: "Grupo D" },
  { id: 20, home: "Australia",     homeCode: "AU", homeTla: "AUS", away: "Turquía",         awayCode: "TR", awayTla: "TUR", date: "2026-06-14T00:00:00-04:00", group: "Grupo D" },
  { id: 21, home: "EEUU",          homeCode: "US", homeTla: "USA", away: "Australia",       awayCode: "AU", awayTla: "AUS", date: "2026-06-19T15:00:00-04:00", group: "Grupo D" },
  { id: 22, home: "Turquía",       homeCode: "TR", homeTla: "TUR", away: "Paraguay",        awayCode: "PY", awayTla: "PAR", date: "2026-06-20T00:00:00-04:00", group: "Grupo D" },
  { id: 23, home: "Turquía",       homeCode: "TR", homeTla: "TUR", away: "EEUU",            awayCode: "US", awayTla: "USA", date: "2026-06-25T22:00:00-04:00", group: "Grupo D" },
  { id: 24, home: "Paraguay",      homeCode: "PY", homeTla: "PAR", away: "Australia",       awayCode: "AU", awayTla: "AUS", date: "2026-06-25T22:00:00-04:00", group: "Grupo D" },

  // ── GRUPO E: Alemania · Curazao · Costa Marfil · Ecuador ──────────────────
  { id: 25, home: "Alemania",      homeCode: "DE", homeTla: "GER", away: "Curazao",         awayCode: "CW", awayTla: "CUR", date: "2026-06-14T13:00:00-04:00", group: "Grupo E" },
  { id: 26, home: "Costa Marfil",  homeCode: "CI", homeTla: "CIV", away: "Ecuador",         awayCode: "EC", awayTla: "ECU", date: "2026-06-14T19:00:00-04:00", group: "Grupo E" },
  { id: 27, home: "Alemania",      homeCode: "DE", homeTla: "GER", away: "Costa Marfil",    awayCode: "CI", awayTla: "CIV", date: "2026-06-20T16:00:00-04:00", group: "Grupo E" },
  { id: 28, home: "Ecuador",       homeCode: "EC", homeTla: "ECU", away: "Curazao",         awayCode: "CW", awayTla: "CUR", date: "2026-06-20T22:00:00-04:00", group: "Grupo E" },
  { id: 29, home: "Curazao",       homeCode: "CW", homeTla: "CUR", away: "Costa Marfil",    awayCode: "CI", awayTla: "CIV", date: "2026-06-25T16:00:00-04:00", group: "Grupo E" },
  { id: 30, home: "Ecuador",       homeCode: "EC", homeTla: "ECU", away: "Alemania",        awayCode: "DE", awayTla: "GER", date: "2026-06-25T16:00:00-04:00", group: "Grupo E" },

  // ── GRUPO F: Países Bajos · Japón · Suecia · Túnez ───────────────────────
  { id: 31, home: "Países Bajos",  homeCode: "NL", homeTla: "NED", away: "Japón",           awayCode: "JP", awayTla: "JPN", date: "2026-06-14T16:00:00-04:00", group: "Grupo F" },
  { id: 32, home: "Suecia",        homeCode: "SE", homeTla: "SWE", away: "Túnez",           awayCode: "TN", awayTla: "TUN", date: "2026-06-14T22:00:00-04:00", group: "Grupo F" },
  { id: 33, home: "Países Bajos",  homeCode: "NL", homeTla: "NED", away: "Suecia",          awayCode: "SE", awayTla: "SWE", date: "2026-06-20T13:00:00-04:00", group: "Grupo F" },
  { id: 34, home: "Túnez",         homeCode: "TN", homeTla: "TUN", away: "Japón",           awayCode: "JP", awayTla: "JPN", date: "2026-06-21T00:00:00-04:00", group: "Grupo F" },
  { id: 35, home: "Japón",         homeCode: "JP", homeTla: "JPN", away: "Suecia",          awayCode: "SE", awayTla: "SWE", date: "2026-06-25T19:00:00-04:00", group: "Grupo F" },
  { id: 36, home: "Túnez",         homeCode: "TN", homeTla: "TUN", away: "Países Bajos",    awayCode: "NL", awayTla: "NED", date: "2026-06-25T19:00:00-04:00", group: "Grupo F" },

  // ── GRUPO G: Bélgica · Egipto · Irán · Nueva Zelanda ─────────────────────
  { id: 37, home: "Bélgica",       homeCode: "BE", homeTla: "BEL", away: "Egipto",          awayCode: "EG", awayTla: "EGY", date: "2026-06-15T15:00:00-04:00", group: "Grupo G" },
  { id: 38, home: "Irán",          homeCode: "IR", homeTla: "IRN", away: "Nueva Zelanda",   awayCode: "NZ", awayTla: "NZL", date: "2026-06-15T21:00:00-04:00", group: "Grupo G" },
  { id: 39, home: "Bélgica",       homeCode: "BE", homeTla: "BEL", away: "Irán",            awayCode: "IR", awayTla: "IRN", date: "2026-06-21T15:00:00-04:00", group: "Grupo G" },
  { id: 40, home: "Nueva Zelanda", homeCode: "NZ", homeTla: "NZL", away: "Egipto",          awayCode: "EG", awayTla: "EGY", date: "2026-06-21T21:00:00-04:00", group: "Grupo G" },
  { id: 41, home: "Egipto",        homeCode: "EG", homeTla: "EGY", away: "Irán",            awayCode: "IR", awayTla: "IRN", date: "2026-06-26T23:00:00-04:00", group: "Grupo G" },
  { id: 42, home: "Nueva Zelanda", homeCode: "NZ", homeTla: "NZL", away: "Bélgica",         awayCode: "BE", awayTla: "BEL", date: "2026-06-26T23:00:00-04:00", group: "Grupo G" },

  // ── GRUPO H: España · Cabo Verde · Arabia Saudí · Uruguay ─────────────────
  { id: 43, home: "España",        homeCode: "ES", homeTla: "ESP", away: "Cabo Verde",      awayCode: "CV", awayTla: "CPV", date: "2026-06-15T12:00:00-04:00", group: "Grupo H" },
  { id: 44, home: "Arabia Saudí",  homeCode: "SA", homeTla: "KSA", away: "Uruguay",         awayCode: "UY", awayTla: "URY", date: "2026-06-15T18:00:00-04:00", group: "Grupo H" },
  { id: 45, home: "España",        homeCode: "ES", homeTla: "ESP", away: "Arabia Saudí",    awayCode: "SA", awayTla: "KSA", date: "2026-06-21T12:00:00-04:00", group: "Grupo H" },
  { id: 46, home: "Uruguay",       homeCode: "UY", homeTla: "URY", away: "Cabo Verde",      awayCode: "CV", awayTla: "CPV", date: "2026-06-21T18:00:00-04:00", group: "Grupo H" },
  { id: 47, home: "Cabo Verde",    homeCode: "CV", homeTla: "CPV", away: "Arabia Saudí",    awayCode: "SA", awayTla: "KSA", date: "2026-06-26T20:00:00-04:00", group: "Grupo H" },
  { id: 48, home: "Uruguay",       homeCode: "UY", homeTla: "URY", away: "España",          awayCode: "ES", awayTla: "ESP", date: "2026-06-26T20:00:00-04:00", group: "Grupo H" },

  // ── GRUPO I: Francia · Senegal · Irak · Noruega ───────────────────────────
  { id: 49, home: "Francia",       homeCode: "FR", homeTla: "FRA", away: "Senegal",         awayCode: "SN", awayTla: "SEN", date: "2026-06-16T15:00:00-04:00", group: "Grupo I" },
  { id: 50, home: "Irak",          homeCode: "IQ", homeTla: "IRQ", away: "Noruega",         awayCode: "NO", awayTla: "NOR", date: "2026-06-16T18:00:00-04:00", group: "Grupo I" },
  { id: 51, home: "Francia",       homeCode: "FR", homeTla: "FRA", away: "Irak",            awayCode: "IQ", awayTla: "IRQ", date: "2026-06-22T17:00:00-04:00", group: "Grupo I" },
  { id: 52, home: "Noruega",       homeCode: "NO", homeTla: "NOR", away: "Senegal",         awayCode: "SN", awayTla: "SEN", date: "2026-06-22T20:00:00-04:00", group: "Grupo I" },
  { id: 53, home: "Noruega",       homeCode: "NO", homeTla: "NOR", away: "Francia",         awayCode: "FR", awayTla: "FRA", date: "2026-06-26T15:00:00-04:00", group: "Grupo I" },
  { id: 54, home: "Senegal",       homeCode: "SN", homeTla: "SEN", away: "Irak",            awayCode: "IQ", awayTla: "IRQ", date: "2026-06-26T15:00:00-04:00", group: "Grupo I" },

  // ── GRUPO J: Argentina · Argelia · Austria · Jordania ─────────────────────
  { id: 55, home: "Argentina",     homeCode: "AR", homeTla: "ARG", away: "Argelia",         awayCode: "DZ", awayTla: "ALG", date: "2026-06-16T21:00:00-04:00", group: "Grupo J" },
  { id: 56, home: "Austria",       homeCode: "AT", homeTla: "AUT", away: "Jordania",        awayCode: "JO", awayTla: "JOR", date: "2026-06-17T00:00:00-04:00", group: "Grupo J" },
  { id: 57, home: "Argentina",     homeCode: "AR", homeTla: "ARG", away: "Austria",         awayCode: "AT", awayTla: "AUT", date: "2026-06-22T13:00:00-04:00", group: "Grupo J" },
  { id: 58, home: "Jordania",      homeCode: "JO", homeTla: "JOR", away: "Argelia",         awayCode: "DZ", awayTla: "ALG", date: "2026-06-22T23:00:00-04:00", group: "Grupo J" },
  { id: 59, home: "Argelia",       homeCode: "DZ", homeTla: "ALG", away: "Austria",         awayCode: "AT", awayTla: "AUT", date: "2026-06-27T22:00:00-04:00", group: "Grupo J" },
  { id: 60, home: "Jordania",      homeCode: "JO", homeTla: "JOR", away: "Argentina",       awayCode: "AR", awayTla: "ARG", date: "2026-06-27T22:00:00-04:00", group: "Grupo J" },

  // ── GRUPO K: Portugal · RD Congo · Uzbekistán · Colombia ─────────────────
  { id: 61, home: "Portugal",      homeCode: "PT", homeTla: "POR", away: "RD Congo",        awayCode: "CD", awayTla: "COD", date: "2026-06-17T13:00:00-04:00", group: "Grupo K" },
  { id: 62, home: "Uzbekistán",    homeCode: "UZ", homeTla: "UZB", away: "Colombia",        awayCode: "CO", awayTla: "COL", date: "2026-06-17T22:00:00-04:00", group: "Grupo K" },
  { id: 63, home: "Portugal",      homeCode: "PT", homeTla: "POR", away: "Uzbekistán",      awayCode: "UZ", awayTla: "UZB", date: "2026-06-23T13:00:00-04:00", group: "Grupo K" },
  { id: 64, home: "Colombia",      homeCode: "CO", homeTla: "COL", away: "RD Congo",        awayCode: "CD", awayTla: "COD", date: "2026-06-23T22:00:00-04:00", group: "Grupo K" },
  { id: 65, home: "Colombia",      homeCode: "CO", homeTla: "COL", away: "Portugal",        awayCode: "PT", awayTla: "POR", date: "2026-06-27T19:30:00-04:00", group: "Grupo K" },
  { id: 66, home: "RD Congo",      homeCode: "CD", homeTla: "COD", away: "Uzbekistán",      awayCode: "UZ", awayTla: "UZB", date: "2026-06-27T19:30:00-04:00", group: "Grupo K" },

  // ── GRUPO L: Inglaterra · Croacia · Ghana · Panamá ───────────────────────
  { id: 67, home: "Inglaterra",    homeCode: "EN", homeTla: "ENG", away: "Croacia",         awayCode: "HR", awayTla: "CRO", date: "2026-06-17T16:00:00-04:00", group: "Grupo L" },
  { id: 68, home: "Ghana",         homeCode: "GH", homeTla: "GHA", away: "Panamá",          awayCode: "PA", awayTla: "PAN", date: "2026-06-17T19:00:00-04:00", group: "Grupo L" },
  { id: 69, home: "Inglaterra",    homeCode: "EN", homeTla: "ENG", away: "Ghana",           awayCode: "GH", awayTla: "GHA", date: "2026-06-23T16:00:00-04:00", group: "Grupo L" },
  { id: 70, home: "Panamá",        homeCode: "PA", homeTla: "PAN", away: "Croacia",         awayCode: "HR", awayTla: "CRO", date: "2026-06-23T19:00:00-04:00", group: "Grupo L" },
  { id: 71, home: "Panamá",        homeCode: "PA", homeTla: "PAN", away: "Inglaterra",      awayCode: "EN", awayTla: "ENG", date: "2026-06-27T17:00:00-04:00", group: "Grupo L" },
  { id: 72, home: "Croacia",       homeCode: "HR", homeTla: "CRO", away: "Ghana",           awayCode: "GH", awayTla: "GHA", date: "2026-06-27T17:00:00-04:00", group: "Grupo L" },

  // ── DIECISEISAVOS (P73–P88) ───────────────────────────────────────────────
  { id: 73, home: "2º Grupo A",  homeCode: "??", homeTla: "??", away: "2º Grupo B",  awayCode: "??", awayTla: "??", date: "2026-06-28T15:00:00-04:00", group: "Dieciseisavos" },
  { id: 74, home: "1º Grupo E",  homeCode: "??", homeTla: "??", away: "3º A/B/C/D/F",awayCode: "??", awayTla: "??", date: "2026-06-29T12:00:00-04:00", group: "Dieciseisavos" },
  { id: 75, home: "1º Grupo F",  homeCode: "??", homeTla: "??", away: "2º Grupo C",  awayCode: "??", awayTla: "??", date: "2026-06-29T15:00:00-04:00", group: "Dieciseisavos" },
  { id: 76, home: "1º Grupo C",  homeCode: "??", homeTla: "??", away: "2º Grupo F",  awayCode: "??", awayTla: "??", date: "2026-06-29T19:00:00-04:00", group: "Dieciseisavos" },
  { id: 77, home: "1º Grupo I",  homeCode: "??", homeTla: "??", away: "3º C/D/F/G/H",awayCode: "??", awayTla: "??", date: "2026-06-30T12:00:00-04:00", group: "Dieciseisavos" },
  { id: 78, home: "2º Grupo E",  homeCode: "??", homeTla: "??", away: "2º Grupo I",  awayCode: "??", awayTla: "??", date: "2026-06-30T15:00:00-04:00", group: "Dieciseisavos" },
  { id: 79, home: "1º Grupo A",  homeCode: "??", homeTla: "??", away: "3º C/E/F/H/I",awayCode: "??", awayTla: "??", date: "2026-06-30T19:00:00-04:00", group: "Dieciseisavos" },
  { id: 80, home: "1º Grupo L",  homeCode: "??", homeTla: "??", away: "3º E/H/I/J/K",awayCode: "??", awayTla: "??", date: "2026-07-01T12:00:00-04:00", group: "Dieciseisavos" },
  { id: 81, home: "1º Grupo D",  homeCode: "??", homeTla: "??", away: "3º B/E/F/I/J",awayCode: "??", awayTla: "??", date: "2026-07-01T15:00:00-04:00", group: "Dieciseisavos" },
  { id: 82, home: "1º Grupo G",  homeCode: "??", homeTla: "??", away: "3º A/E/H/I/J",awayCode: "??", awayTla: "??", date: "2026-07-01T19:00:00-04:00", group: "Dieciseisavos" },
  { id: 83, home: "2º Grupo K",  homeCode: "??", homeTla: "??", away: "2º Grupo L",  awayCode: "??", awayTla: "??", date: "2026-07-02T12:00:00-04:00", group: "Dieciseisavos" },
  { id: 84, home: "1º Grupo H",  homeCode: "??", homeTla: "??", away: "2º Grupo J",  awayCode: "??", awayTla: "??", date: "2026-07-02T15:00:00-04:00", group: "Dieciseisavos" },
  { id: 85, home: "1º Grupo B",  homeCode: "??", homeTla: "??", away: "3º E/F/G/I/J",awayCode: "??", awayTla: "??", date: "2026-07-02T19:00:00-04:00", group: "Dieciseisavos" },
  { id: 86, home: "1º Grupo J",  homeCode: "??", homeTla: "??", away: "2º Grupo H",  awayCode: "??", awayTla: "??", date: "2026-07-03T12:00:00-04:00", group: "Dieciseisavos" },
  { id: 87, home: "1º Grupo K",  homeCode: "??", homeTla: "??", away: "3º D/E/I/J/L",awayCode: "??", awayTla: "??", date: "2026-07-03T15:00:00-04:00", group: "Dieciseisavos" },
  { id: 88, home: "2º Grupo D",  homeCode: "??", homeTla: "??", away: "2º Grupo G",  awayCode: "??", awayTla: "??", date: "2026-07-03T19:00:00-04:00", group: "Dieciseisavos" },

  // ── OCTAVOS DE FINAL (P89–P96) ────────────────────────────────────────────
  { id: 89, home: "G74", homeCode: "??", homeTla: "??", away: "G77", awayCode: "??", awayTla: "??", date: "2026-07-04T15:00:00-04:00", group: "Octavos de Final" },
  { id: 90, home: "G73", homeCode: "??", homeTla: "??", away: "G75", awayCode: "??", awayTla: "??", date: "2026-07-04T19:00:00-04:00", group: "Octavos de Final" },
  { id: 91, home: "G76", homeCode: "??", homeTla: "??", away: "G78", awayCode: "??", awayTla: "??", date: "2026-07-05T15:00:00-04:00", group: "Octavos de Final" },
  { id: 92, home: "G79", homeCode: "??", homeTla: "??", away: "G80", awayCode: "??", awayTla: "??", date: "2026-07-05T19:00:00-04:00", group: "Octavos de Final" },
  { id: 93, home: "G83", homeCode: "??", homeTla: "??", away: "G84", awayCode: "??", awayTla: "??", date: "2026-07-06T15:00:00-04:00", group: "Octavos de Final" },
  { id: 94, home: "G81", homeCode: "??", homeTla: "??", away: "G82", awayCode: "??", awayTla: "??", date: "2026-07-06T19:00:00-04:00", group: "Octavos de Final" },
  { id: 95, home: "G86", homeCode: "??", homeTla: "??", away: "G88", awayCode: "??", awayTla: "??", date: "2026-07-07T15:00:00-04:00", group: "Octavos de Final" },
  { id: 96, home: "G85", homeCode: "??", homeTla: "??", away: "G87", awayCode: "??", awayTla: "??", date: "2026-07-07T19:00:00-04:00", group: "Octavos de Final" },

  // ── CUARTOS DE FINAL (P97–P100) ───────────────────────────────────────────
  { id: 97,  home: "G89", homeCode: "??", homeTla: "??", away: "G90", awayCode: "??", awayTla: "??", date: "2026-07-09T15:00:00-04:00", group: "Cuartos de Final" },
  { id: 98,  home: "G93", homeCode: "??", homeTla: "??", away: "G94", awayCode: "??", awayTla: "??", date: "2026-07-10T15:00:00-04:00", group: "Cuartos de Final" },
  { id: 99,  home: "G91", homeCode: "??", homeTla: "??", away: "G92", awayCode: "??", awayTla: "??", date: "2026-07-11T15:00:00-04:00", group: "Cuartos de Final" },
  { id: 100, home: "G95", homeCode: "??", homeTla: "??", away: "G96", awayCode: "??", awayTla: "??", date: "2026-07-11T19:00:00-04:00", group: "Cuartos de Final" },

  // ── SEMIFINALES (P101–P102) ───────────────────────────────────────────────
  { id: 101, home: "G97", homeCode: "??", homeTla: "??", away: "G98", awayCode: "??", awayTla: "??", date: "2026-07-14T15:00:00-04:00", group: "Semifinales" },
  { id: 102, home: "G99", homeCode: "??", homeTla: "??", away: "G100",awayCode: "??", awayTla: "??", date: "2026-07-15T15:00:00-04:00", group: "Semifinales" },

  // ── TERCER PUESTO y FINAL ─────────────────────────────────────────────────
  { id: 103, home: "Perdedor SF1", homeCode: "??", homeTla: "??", away: "Perdedor SF2", awayCode: "??", awayTla: "??", date: "2026-07-18T15:00:00-04:00", group: "3er Puesto" },
  { id: 104, home: "Ganador SF1",  homeCode: "??", homeTla: "??", away: "Ganador SF2",  awayCode: "??", awayTla: "??", date: "2026-07-19T15:00:00-04:00", group: "Final" },
];

const { query } = require("../db/database");

// Index knockout matches by UTC minute for team-name sync
const KNOCKOUT_BY_UTC = {};
MATCHES.filter(m => m.id >= 73).forEach(m => {
  const key = new Date(m.date).toISOString().slice(0, 16); // "2026-07-04T19:00"
  KNOCKOUT_BY_UTC[key] = m.id;
});

// TLA → ISO-2 flag code for all 48 WC teams
const TLA_TO_ISO2 = {
  MEX:"MX", RSA:"ZA", KOR:"KR", CZE:"CZ", CAN:"CA", BIH:"BA", QAT:"QA", SUI:"CH",
  BRA:"BR", MAR:"MA", HAI:"HT", SCO:"SC", USA:"US", PAR:"PY", AUS:"AU", TUR:"TR",
  GER:"DE", CUR:"CW", CIV:"CI", ECU:"EC", NED:"NL", JPN:"JP", SWE:"SE", TUN:"TN",
  BEL:"BE", EGY:"EG", IRN:"IR", NZL:"NZ", ESP:"ES", CPV:"CV", KSA:"SA", URY:"UY",
  FRA:"FR", SEN:"SN", IRQ:"IQ", NOR:"NO", ARG:"AR", ALG:"DZ", AUT:"AT", JOR:"JO",
  POR:"PT", COD:"CD", UZB:"UZ", COL:"CO", ENG:"EN", CRO:"HR", GHA:"GH", PAN:"PA",
};

// TLA → Spanish display name (built from our MATCHES data)
const TLA_TO_NAME = {};
MATCHES.filter(m => m.homeTla !== "??").forEach(m => {
  TLA_TO_NAME[m.homeTla] = m.home;
  TLA_TO_NAME[m.awayTla] = m.away;
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { rows: overrides } = await query("SELECT * FROM match_teams");
    if (overrides.length === 0) return res.json(MATCHES);
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.match_id] = o; });
    res.json(MATCHES.map(m => {
      const ov = overrideMap[m.id];
      if (!ov) return m;
      return { ...m, home: ov.home, homeCode: ov.home_code, away: ov.away, awayCode: ov.away_code };
    }));
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.MATCHES        = MATCHES;
module.exports.KNOCKOUT_BY_UTC = KNOCKOUT_BY_UTC;
module.exports.TLA_TO_ISO2    = TLA_TO_ISO2;
module.exports.TLA_TO_NAME    = TLA_TO_NAME;
