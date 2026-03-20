const INDUSTRIAL_ENV_TILE_ROOT =
  "sprites/kenney_pixel-platformer-industrial-expansion/Tiles";

function tilePath(index) {
  return `${INDUSTRIAL_ENV_TILE_ROOT}/tile_${String(index).padStart(4, "0")}.png`;
}

function spriteId(tileName) {
  return `env_industrial_${tileName}`;
}

export const INDUSTRIAL_ENV_TILE_ORDER = Object.freeze({
  concrete_soil_single: 0,
  concrete_soil_single_left: 1,
  concrete_soil_single_center: 2,
  concrete_soil_single_right: 3,
  girder_left: 4,
  girder_center: 5,
  girder_right: 6,
  rope_start: 7,
  girder_support_top: 38,
  chain_start: 8,
  chain_top: 8,
  barrel_orange: 9,
  barrel_blue: 10,
  ladder: 11,
  toxic_top_single: 12,
  toxic_top_left: 13,
  toxic_top_center: 14,
  toxic_top_right: 15,
  concrete_soil_top_multi_single: 16,
  concrete_soil_top_left: 17,
  concrete_soil_top_center: 18,
  concrete_soil_top_right: 19,
  girder_damaged_left: 20,
  girder_damaged_center: 21,
  girder_damaged_right: 22,
  rope_center: 23,
  girder_support_alt: 54,
  chain_center: 24,
  chain_middle: 24,
  door: 28,
  toxic_fill_single: 29,
  toxic_fill_left: 30,
  toxic_fill_right: 31,
  concrete_soil_center_single: 32,
  concrete_soil_center_left: 33,
  concrete_soil_center_center: 34,
  concrete_soil_center_right: 35,
  shaft_ladder_top: 36,
  shaft_brace_top: 37,
  shaft_connector_top: 38,
  rope_end: 39,
  chain_end: 40,
  hook_end: 40,
  pipe_vertical: 44,
  toxic_body_single: 45,
  toxic_body_left: 46,
  toxic_body_right: 47,
  concrete_soil_bottom_single: 48,
  concrete_soil_bottom_left: 49,
  concrete_soil_bottom_center: 50,
  concrete_soil_bottom_right: 51,
  shaft_ladder_center: 52,
  shaft_brace_center: 53,
  shaft_connector_center: 54,
  ladder_base: 52,
  support_brace: 53,
  support_vertical: 54,
  chain_end_attached: 56,
  rope_end_attached: 55,
  chain_hook: 56,
  vertical_pole: 58,
  vertical_pipe_start: 59,
  pipe_cap: 59,
  console_blue_left: 60,
  console_blue_right: 61,
  crate_yellow_left: 62,
  crate_yellow_right: 63,
  decor_floor_left: 64,
  decor_floor_right: 65,
  shaft_ladder_bottom: 68,
  shaft_brace_bottom: 69,
  shaft_connector_bottom: 70,
  decor_machine_left: 71,
  decor_machine_right: 72,
  decor_column_top: 9,
  decor_column_upper: 25,
  decor_column_middle: 41,
  decor_column_lower: 57,
  decor_column_bottom: 73,
  decor_console_left: 60,
  decor_console_right: 61,
  pipe_elbow_down_right: 76,
  pipe_elbow_down_left: 77,
  vertical_pipe_pour_left: 78,
  vertical_pipe_pour_right: 79,
  vertical_pipe_center_upper: 75,
  vertical_pipe_center_lower: 91,
  pipe_elbow_up_right: 92,
  pipe_elbow_up_left: 93,
  poured_water_left: 94,
  poured_water_right: 95,
  machine_track_left: 100,
  machine_track_center: 101,
  machine_track_right: 102,
  machine_panel: 103,
  horizontal_pipe_start: 108,
  horizontal_pipe_center_left: 109,
  horizontal_pipe_center_right: 110,
  horizontal_pipe_end: 111,
  vertical_pipe_end: 107,
  ground_top_single: 0,
  ground_top_left: 1,
  ground_top_center: 2,
  ground_top_right: 3,
  ground_top_supported_single: 16,
  ground_top_supported_left: 17,
  ground_top_supported_center: 18,
  ground_top_supported_right: 19,
  ground_mid_single: 32,
  ground_mid_left: 33,
  ground_mid_center: 34,
  ground_mid_right: 35,
  ground_bottom_single: 48,
  ground_bottom_left: 49,
  ground_bottom_center: 50,
  ground_bottom_right: 51,
});

export const INDUSTRIAL_ENV_TILE_SPRITES = Object.freeze(
  Object.fromEntries(
    Object.entries(INDUSTRIAL_ENV_TILE_ORDER).map(([tileName, tileIndex]) => [
      tileName,
      {
        sprite: spriteId(tileName),
        path: tilePath(tileIndex),
      },
    ]),
  ),
);

export function loadEnvironmentTileIndustrialAssets(k) {
  Object.values(INDUSTRIAL_ENV_TILE_SPRITES).forEach(({ sprite, path }) => {
    k.loadSprite(sprite, path);
  });
}

export function getEnvironmentTileIndustrialSprite(tileName) {
  const tile = INDUSTRIAL_ENV_TILE_SPRITES[tileName];
  if (!tile) {
    throw new Error(`Environment industrial tile "${tileName}" non definito.`);
  }
  return tile.sprite;
}
