const SIGN_DIALOG_PAGES = [
  "[ATTENZIONE!!]\n\nZona infestata da mostri!",
  "Non sappiamo da dove arrivino ma siamo invasi da mostri e alieni!",
  "MIMMI! \n\n solo tu puoi aiutarci! ",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Vecchio saggio:\nGrazie Mimmi finalmente sei arrivata!",
  "Vecchio saggio: ...\nOttimo lavoro! hai capito come sfuggire ai mostri\n ma solo tu puoi aiutarci a combatterli",
  "Vecchio saggio: ...\nHo scoperto che ad ANDRIA tu potrai trovare qualcosa per combatterli",
  "Vecchio saggio: ...\nMIMMI AIUTACI TU!",
];

export function getLevelOneSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelOneGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}
