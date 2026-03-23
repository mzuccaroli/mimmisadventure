const SIGN_DIALOG_PAGES = [
  "ANDRIA\n\nIngresso est della citta'.",
  "Attenzione: passerelle, tubi e canali sono instabili.",
  "Raggiungi il vecchio saggio oltre le bandiere.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Regina di Andria:\nBenvenuta ad Andria, Mimmi.",
  "Regina di Andria: ...\nHai superato mostri, spuntoni e i canali della citta'.",
  "Regina di Andria: ...\nPerfetto, questo livello adesso e' pronto per i test.",
];

const LEVEL_LIBERATION_DIALOG_PAGES = [
  "Regina di Andria:\nGrazie Mimmi per avere liberato Andria!",
  "Regina di Andria: ...\nTutti i mostri sono diventati fatine innocue.",
  "Regina di Andria: ...\nLa citta' puo' finalmente respirare di nuovo.",
];

export function getLevelTwoSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelTwoGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}

export function getLevelTwoLiberationDialogPages() {
  return [...LEVEL_LIBERATION_DIALOG_PAGES];
}
