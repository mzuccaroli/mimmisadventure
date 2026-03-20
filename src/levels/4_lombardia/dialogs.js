const SIGN_DIALOG_PAGES = [
  "[LOMBARDIA]\n\nStrada d'ingresso ai campi del nord.",
  "Attenzione: il sentiero e' corto ma pieno di piccoli ostacoli.",
  "Raggiungi la guida in fondo al percorso.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Guida di Lombardia:\nBen arrivata, Mimmi.",
  "Guida di Lombardia: ...\nQuesto e' solo un primo tratto del viaggio, ma la strada e' aperta.",
  "Guida di Lombardia: ...\nPossiamo ampliare il livello con borghi, cascine e nuovi salti.",
];

export function getLevelFourLombardiaSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelFourLombardiaGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}
