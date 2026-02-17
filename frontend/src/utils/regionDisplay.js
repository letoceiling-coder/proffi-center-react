/**
 * Название региона в предложном падеже для фраз типа «в Анапе и Анапском районе».
 * Для известных регионов — захардкожено; при необходимости можно вынести в API.
 */
const REGION_PREPOSITIONAL = {
  'Краснодарский край': 'Краснодарском крае',
  'Ставропольский край': 'Ставропольском крае',
  'Москва и Московская область': 'Москве и Московской области',
};

export function getRegionPrepositional(regionName) {
  if (!regionName) return '';
  return REGION_PREPOSITIONAL[regionName] || regionName;
}
