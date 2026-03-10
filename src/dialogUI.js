const DIALOG_PANEL_Z = 110;
const DIALOG_TEXT_Z = 111;
const DIALOG_HINT_Z = 112;

const SIGN_PLACEHOLDER_PAGES = [
  "[Placeholder dialogo - 1/3]\nPersonaggio: ...\nNPC: ...\nIl viaggio non e ancora finito.",
  "[Placeholder dialogo - 2/3]\nPersonaggio: ...\nNPC: ...\nQui andra la seconda battuta del dialogo.",
  "[Placeholder dialogo - 3/3]\nPersonaggio: ...\nNPC: ...\nFine dialogo placeholder.",
];

const LEVEL_GOAL_PLACEHOLDER_PAGES = [
  "[Traguardo - 1/3]\nPersonaggio: ...\nHai raggiunto la fine del livello!",
  "[Traguardo - 2/3]\nNPC: ...\nOttimo lavoro, preparati alla prossima sfida.",
  "[Traguardo - 3/3]\nSistema: ...\nPlaceholder dialogo finale del livello.",
];

export function getSignPlaceholderPages() {
  return [...SIGN_PLACEHOLDER_PAGES];
}

export function getLevelGoalPlaceholderPages() {
  return [...LEVEL_GOAL_PLACEHOLDER_PAGES];
}

export function createDialogSystem(k) {
  let panel = null;
  let textNode = null;
  let hintNode = null;
  let pages = [];
  let pageIndex = 0;
  let opened = false;
  let onClose = null;

  function destroyActiveNodes() {
    if (panel) panel.destroy();
    if (textNode) textNode.destroy();
    if (hintNode) hintNode.destroy();
    panel = null;
    textNode = null;
    hintNode = null;
  }

  function renderPage() {
    if (!opened || !pages.length) return;

    if (textNode) textNode.destroy();
    if (hintNode) hintNode.destroy();

    const dialogWidth = Math.min(760, k.width() - 64);
    const dialogHeight = 170;
    const dialogX = k.width() / 2;
    const dialogY = k.height() - dialogHeight / 2 - 24;
    const pageCounter = `${pageIndex + 1}/${pages.length}`;

    textNode = k.add([
      k.text(pages[pageIndex], { size: 22, width: dialogWidth - 40, lineSpacing: 8 }),
      k.pos(dialogX - dialogWidth / 2 + 20, dialogY - dialogHeight / 2 + 20),
      k.anchor("topleft"),
      k.color(240, 240, 240),
      k.fixed(),
      k.z(DIALOG_TEXT_Z),
    ]);

    hintNode = k.add([
      k.text(`Spazio: continua   ${pageCounter}`, { size: 16 }),
      k.pos(dialogX + dialogWidth / 2 - 16, dialogY + dialogHeight / 2 - 14),
      k.anchor("botright"),
      k.color(220, 220, 220),
      k.fixed(),
      k.z(DIALOG_HINT_Z),
    ]);
  }

  function closeDialog() {
    if (!opened) return;
    opened = false;
    pages = [];
    pageIndex = 0;
    destroyActiveNodes();
    if (onClose) {
      const callback = onClose;
      onClose = null;
      callback();
    }
  }

  function openDialog(dialogPages, options = {}) {
    const { onClose: onCloseCallback = null } = options;
    const normalizedPages =
      Array.isArray(dialogPages) && dialogPages.length > 0
        ? dialogPages
        : getSignPlaceholderPages();

    if (opened) {
      closeDialog();
    }

    opened = true;
    pages = normalizedPages;
    pageIndex = 0;
    onClose = onCloseCallback;

    const dialogWidth = Math.min(760, k.width() - 64);
    const dialogHeight = 170;
    const dialogX = k.width() / 2;
    const dialogY = k.height() - dialogHeight / 2 - 24;

    panel = k.add([
      k.pos(dialogX, dialogY),
      k.rect(dialogWidth, dialogHeight),
      k.anchor("center"),
      k.color(18, 24, 40),
      k.opacity(0.88),
      k.fixed(),
      k.z(DIALOG_PANEL_Z),
    ]);

    renderPage();
  }

  function nextPage() {
    if (!opened) return false;

    if (pageIndex >= pages.length - 1) {
      closeDialog();
      return true;
    }

    pageIndex += 1;
    renderPage();
    return true;
  }

  k.onKeyPress("space", () => {
    if (!opened) return;
    nextPage();
  });

  return {
    openDialog,
    closeDialog,
    nextPage,
    isOpen: () => opened,
  };
}
