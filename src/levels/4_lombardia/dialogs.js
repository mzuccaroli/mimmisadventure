const SIGN_DIALOG_PAGES = [
  "LOMBARDIA\n\nStrada d'ingresso ai campi del nord.",
  "Attenzione: il sentiero e' corto ma pieno di piccoli ostacoli.",
  "Raggiungi la guida in fondo al percorso.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Guida di Lombardia:\nBen arrivata, Mimmi.",
  "Guida di Lombardia: ...\nQuesto e' solo un primo tratto del viaggio, ma la strada e' aperta.",
  "Guida di Lombardia: ...\nPossiamo ampliare il livello con borghi, cascine e nuovi salti.",
];

const LEVEL_LIBERATION_DIALOG_PAGES = [
  "Guida di Lombardia:\nGrazie Mimmi per avere liberato Lombardia!",
  "Guida di Lombardia: ...\nAnche gli ultimi mostri sono diventati innocue fatine.",
  "Guida di Lombardia: ...\nOra la strada e' davvero libera.",
];

export function getLevelFourLombardiaSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelFourLombardiaGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}

export function getLevelFourLombardiaLiberationDialogPages() {
  return [...LEVEL_LIBERATION_DIALOG_PAGES];
}
