const SIGN_DIALOG_PAGES = [
  "[MONTEGROSSO]\n\nSentiero basso del borgo.",
  "Pochi mostri in zona, ma il terreno e' irregolare.",
  "Raggiungi il saggio oltre gli spuntoni.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Saggio di Montegrosso:\nBen arrivata, Mimmi.",
  "Saggio di Montegrosso: ...\nQuesto e' solo un primo tratto del monte, ma il passaggio funziona.",
  "Saggio di Montegrosso: ...\nPossiamo ampliare il livello con nuovi salti e piu' pericoli.",
];

export function getLevelThreeMontegrossoSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelThreeMontegrossoGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}
