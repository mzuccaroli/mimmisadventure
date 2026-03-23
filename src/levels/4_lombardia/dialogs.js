const SIGN_DIALOG_PAGES = [
  "LOMBARDIA\n\nAttenzione, scarichi tossici",
  "Siamo infestati da ogni tipo di mostro",
  "C'è una persona importante in fondo al percorso.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Principessa delle fate:\nBen arrivata, Mimmi! Ti aspettavo!",
  "Principessa delle fate: ...\nLe mie figlie sono state contagiate dai liquami tossici e si sono trasformate in mostri",
  "Principessa delle fate: ...\nTi faccio dono della mia magia, così puoi tornare indietro a salvare tutte le mie figlie!",
];

const LEVEL_LIBERATION_DIALOG_PAGES = [
  "Principessa delle fate:\nGrazie Mimmi la Lombardia è salva e tutte le mie figlie sono tornate!",
  "Principessa delle fate: ...\nOra la strada e' davvero libera per tantissime altre avventure!.",
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
