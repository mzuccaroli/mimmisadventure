const SIGN_DIALOG_PAGES = [
  "[MONTEGROSSO]\n\nCampi e serre del borgo.",
  "Attenzione: i passaggi tra gli orti sono stretti e pieni di ostacoli.",
  "Raggiungi il saggio oltre la serra.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Brigante di Montegrosso:\nBen arrivata, Mimmi.",
  "Brigante di Montegrosso: ...\nAdesso il borgo ha finalmente l'aspetto dei campi che volevamo.",
  "Brigante di Montegrosso: ...\nPossiamo ampliare il livello con nuove serre, sentieri e salti.",
];

export function getLevelThreeMontegrossoSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelThreeMontegrossoGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}
