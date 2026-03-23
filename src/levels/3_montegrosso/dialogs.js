const SIGN_DIALOG_PAGES = [
  "MONTEGROSSO\n\nCampi e serre del borgo.",
  "Attenzione: i passaggi tra gli orti sono stretti e pieni di ostacoli.",
  "Raggiungi il saggio oltre la serra.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Brigante di Montegrosso:\nBen arrivata, Mimmi.",
  "Brigante di Montegrosso: ...\nAdesso il borgo ha finalmente l'aspetto dei campi che volevamo.",
  "Brigante di Montegrosso: ...\nPossiamo ampliare il livello con nuove serre, sentieri e salti.",
];

const LEVEL_LIBERATION_DIALOG_PAGES = [
  "Brigante di Montegrosso:\nGrazie Mimmi per avere liberato Montegrosso!",
  "Brigante di Montegrosso: ...\nNon e' rimasto nemmeno un mostro tra campi e serre.",
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
