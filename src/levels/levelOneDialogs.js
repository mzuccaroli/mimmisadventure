const SIGN_DIALOG_PAGES = [
  "[ATTENZIONE!!]\n\nZona infestata da mostri!",
  "Non sappiamo cosa sia successo ma siamo invasi da mostri e alieni!",
  "MIMMI! \n\n solo tu puoi aiutarci! ",
];

const LEVEL_GOAL_DIALOG_PAGES = [
  "Vecchio saggio:\nGrazie Mimmi finalmente sei arrivata!",
  "Vecchio saggio: ...\nOttimo lavoro, hai capito come sfuggire ai mostri ma solo tu puoi aiutarci a combatterili",
  "Vecchio saggio: ...\nNon sappiamo da dove arrivino ma ci sono mostri ovunque! Ho scoperto che ad ANDRIA tu potrai trovare qualcosa per combatterli",
  "Vecchio saggio: ...\nMIMMI AIUTACI TU!",
];

export function getLevelOneSignDialogPages() {
  return [...SIGN_DIALOG_PAGES];
}

export function getLevelOneGoalDialogPages() {
  return [...LEVEL_GOAL_DIALOG_PAGES];
}
