const SIGN_DIALOG_PAGES = [
  "MONTEGROSSO\n\nCampi, tendoni, uliveti e un sacco di cugini",
  "Attenzione: i passaggi tra i campi sono stretti e pieni di ostacoli.",
  "Si dice che i briganti del posto sappiano difendersi dai mostri",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Brigante di Montegrosso:\nBen arrivata, Mimmi.",
  "Brigante di Montegrosso: ...\nSo che stai cercando la soluzione per liberarci dai mostri",
  "Brigante di Montegrosso: ...\nNoi cugini briganti siamo diventati bravissimi a lanciargli le olive, prova anche tu!",
  "Brigante di Montegrosso: ...\nSappiamo anche che esiste un posto lontano e pericolosissimo da cui sono venuti tutti i mostri",
  "Brigante di Montegrosso: ...\nLA LOMBARDIA!",
];

const LEVEL_LIBERATION_DIALOG_PAGES = [
  "Brigante di Montegrosso:\nGrazie Mimmi per avere liberato Montegrosso!",
  "Brigante di Montegrosso: ...\nLa vendemmia è salva e tutti i cugini possono ricominciare a fare festa!",
  "Brigante di Montegrosso: ...\nAdesso il borgo e' di nuovo nostro.",
];

export function getLevelThreeMontegrossoSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelThreeMontegrossoGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}

export function getLevelThreeMontegrossoLiberationDialogPages() {
  return [...LEVEL_LIBERATION_DIALOG_PAGES];
}
