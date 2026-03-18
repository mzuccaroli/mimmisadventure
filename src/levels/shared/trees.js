import { GAME_CONFIG } from "../../tiles.js";
import { getEnvironmentTileSprite } from "../../environmentTiles.js";
import { getEnvironmentTileFarmSprite } from "../../environmentTiles_farm.js";

const TREE_FAMILY_YELLOW = "yellow";
const TREE_FAMILY_GREEN = "green";
const TREE_CANOPY_Z = 1;
const TREE_TRUNK_Z = 2;
const TREE_BRANCH_Z = 2;

const TREE_BRANCH_CHARS_INTERNAL = new Set(["L", "M", "R", "x", "m"]);

const TREE_CANOPY_TILE_BY_CHAR = Object.freeze({
  q: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_top_left" },
  w: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_top_center" },
  e: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_top_right" },
  a: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_mid_left" },
  d: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_mid_center" },
  f: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_mid_right" },
  c: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_bottom_left" },
  j: { family: TREE_FAMILY_YELLOW, sprite: "tree_large_canopy_connector" },
  g: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_bottom_center" },
  h: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_wide_bottom_right" },
  t: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_single_top" },
  u: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_single_upper" },
  i: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_single_lower" },
  o: { family: TREE_FAMILY_YELLOW, sprite: "tree_crown_single_bottom" },
  Q: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_top_left" },
  W: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_top_center" },
  T: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_top_right" },
  A: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_upper_left" },
  D: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_upper_center" },
  F: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_upper_right" },
  Z: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_lower_left" },
  J: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_canopy_connector" },
  C: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_lower_right" },
  V: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_horizontal_left" },
  G: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_horizontal_center" },
  H: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_horizontal_right" },
  Y: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_top" },
  U: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_upper" },
  I: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_lower" },
  O: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_bottom" },
});

const TREE_TRUNK_TILE_BY_CHAR = Object.freeze({
  n: { family: TREE_FAMILY_YELLOW, sprite: "tree_trunk_plain" },
  k: { family: TREE_FAMILY_YELLOW, sprite: "tree_large_trunk_top" },
  b: { family: TREE_FAMILY_YELLOW, sprite: "tree_trunk_branch_both" },
  l: { family: TREE_FAMILY_YELLOW, sprite: "tree_trunk_branch_left" },
  r: { family: TREE_FAMILY_YELLOW, sprite: "tree_trunk_branch_right" },
  1: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_trunk_top" },
  2: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_trunk_plain" },
  4: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_trunk_branch_both" },
  5: { family: TREE_FAMILY_GREEN, sprite: "base_tree_wide_trunk_branch_right" },
  6: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_trunk_top" },
  7: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_trunk_plain" },
  8: { family: TREE_FAMILY_GREEN, sprite: "base_tree_single_trunk_branch_left" },
});

const TREE_TRUNK_CHARS_INTERNAL = new Set(Object.keys(TREE_TRUNK_TILE_BY_CHAR));
const LEFT_BRANCH_CONNECTOR_CHARS = new Set(["b", "l", "4", "8"]);
const RIGHT_BRANCH_CONNECTOR_CHARS = new Set(["b", "r", "4", "5"]);

export const TREE_BRANCH_CHARS = TREE_BRANCH_CHARS_INTERNAL;
export const TREE_TRUNK_CHARS = TREE_TRUNK_CHARS_INTERNAL;

function mapCharAt(mapLines, row, col) {
  if (row < 0 || row >= mapLines.length) return " ";
  if (col < 0 || col >= mapLines[row].length) return " ";
  return mapLines[row][col];
}

function addFarmSprite(k, spriteName, x, y, z = 1) {
  return k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileFarmSprite(spriteName)),
    k.z(z),
  ]);
}

function addGreenSprite(k, spriteName, x, y, z = 1) {
  return k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileSprite(spriteName)),
    k.z(z),
  ]);
}

function addTreeSprite(k, family, spriteName, x, y, z) {
  return family === TREE_FAMILY_GREEN
    ? addGreenSprite(k, spriteName, x, y, z)
    : addFarmSprite(k, spriteName, x, y, z);
}

function addTreeTrunkColliderCell(k, x, y, terrainTag) {
  k.add([
    k.pos(x, y),
    k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    terrainTag,
  ]);
}

function addBranchPlatformCollider(k, x, y, terrainTag, widthInTiles = 3) {
  k.add([
    k.pos(x, y + GAME_CONFIG.tile * 0.58),
    k.rect(widthInTiles * GAME_CONFIG.tile, GAME_CONFIG.tile * 0.22),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    terrainTag,
  ]);
}

function isBranchConnectorForLeftSide(cell) {
  return LEFT_BRANCH_CONNECTOR_CHARS.has(cell);
}

function isBranchConnectorForRightSide(cell) {
  return RIGHT_BRANCH_CONNECTOR_CHARS.has(cell);
}

function getBranchSprite(family, branchCell) {
  if (family === TREE_FAMILY_GREEN) {
    return branchCell === "L"
      ? "base_tree_branch_tip_left"
      : branchCell === "R"
        ? "base_tree_branch_tip_right"
        : branchCell === "x"
          ? "base_tree_branch_leaf_end_left"
          : branchCell === "m"
            ? "base_tree_branch_leaf_center"
            : "base_tree_branch_horizontal";
  }

  return branchCell === "L"
    ? "tree_branch_stub"
    : branchCell === "R"
      ? "tree_branch_tip"
      : branchCell === "x"
        ? "tree_branch_leaf_end_left"
        : branchCell === "m"
          ? "tree_branch_leaf_center"
          : "tree_branch_horizontal";
}

function renderBranchFromConnector(k, mapLines, row, col, direction, mapOffsetY, family, terrainTag) {
  const step = direction === "left" ? -1 : 1;
  const endCells = direction === "left" ? new Set(["L", "x"]) : new Set(["R"]);
  const centerCells = direction === "left" ? new Set(["M", "m"]) : new Set(["M"]);
  const firstCol = col + step;
  const firstCell = mapCharAt(mapLines, row, firstCol);

  if (!centerCells.has(firstCell)) {
    return false;
  }

  let cursor = firstCol;
  const branchCols = [cursor];

  while (centerCells.has(mapCharAt(mapLines, row, cursor + step))) {
    cursor += step;
    branchCols.push(cursor);
  }

  const tipCol = cursor + step;
  if (!endCells.has(mapCharAt(mapLines, row, tipCol))) {
    return false;
  }

  branchCols.push(tipCol);

  branchCols.forEach((branchCol) => {
    const branchCell = mapCharAt(mapLines, row, branchCol);
    addTreeSprite(
      k,
      family,
      getBranchSprite(family, branchCell),
      branchCol * GAME_CONFIG.tile,
      mapOffsetY + row * GAME_CONFIG.tile,
      TREE_BRANCH_Z,
    );
  });

  const startCol = Math.min(...branchCols);
  addBranchPlatformCollider(
    k,
    startCol * GAME_CONFIG.tile,
    mapOffsetY + row * GAME_CONFIG.tile,
    terrainTag,
    branchCols.length,
  );

  return true;
}

export function isTreeTerrainCell(cell) {
  return TREE_BRANCH_CHARS_INTERNAL.has(cell) || TREE_TRUNK_CHARS_INTERNAL.has(cell);
}

export function renderAsciiTreeCell({ k, mapLines, row, col, mapOffsetY, terrainTag }) {
  const cell = mapCharAt(mapLines, row, col);

  if (TREE_CANOPY_TILE_BY_CHAR[cell]) {
    const tileDef = TREE_CANOPY_TILE_BY_CHAR[cell];
    addTreeSprite(
      k,
      tileDef.family,
      tileDef.sprite,
      col * GAME_CONFIG.tile,
      mapOffsetY + row * GAME_CONFIG.tile,
      TREE_CANOPY_Z,
    );
    return true;
  }

  if (TREE_TRUNK_CHARS_INTERNAL.has(cell)) {
    const tileDef = TREE_TRUNK_TILE_BY_CHAR[cell];
    const x = col * GAME_CONFIG.tile;
    const y = mapOffsetY + row * GAME_CONFIG.tile;

    addTreeSprite(k, tileDef.family, tileDef.sprite, x, y, TREE_TRUNK_Z);
    addTreeTrunkColliderCell(k, x, y, terrainTag);

    if (isBranchConnectorForLeftSide(cell)) {
      renderBranchFromConnector(
        k,
        mapLines,
        row,
        col,
        "left",
        mapOffsetY,
        tileDef.family,
        terrainTag,
      );
    }

    if (isBranchConnectorForRightSide(cell)) {
      renderBranchFromConnector(
        k,
        mapLines,
        row,
        col,
        "right",
        mapOffsetY,
        tileDef.family,
        terrainTag,
      );
    }

    return true;
  }

  return TREE_BRANCH_CHARS_INTERNAL.has(cell);
}
