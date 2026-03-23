const SIGN_DIALOG_PAGES = [
  "ANDRIA\n\nIngresso est della citta'.",
  "Attenzione: passerelle, tubi e canali sono instabili...\n e alcuni mostri saltano da tutte le parti!",
  "Raggiungi la regina ti aspetta oltre le bandiere.",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Regina di Andria:\nBenvenuta nel cuore di Andria, Mimmi.",
  "Regina di Andria: ...\nNella mia infinita saggezza ho fatto una scoperta senzazionale!",
  "Regina di Andria: ...\nI mostri hanno paura delle cime di rapa!",
  "Regina di Andria: ...\nTe ne dono un mazzetto per aiutarti a combatterli",
];

const LEVEL_LIBERATION_DIALOG_PAGES = [
  "Regina di Andria:\nGrazie Mimmi per avere liberato Andria!",
  "Regina di Andria: ...\nTutti i mostri sono tornati ad essere fatine",
  "Regina di Andria: ...\nLa citta' puo' finalmente respirare di nuovo e i caseifici possono riaprire!",
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
