/**
 * Exercise Images - Static require map for React Native
 *
 * React Native requires static require() calls for bundled images.
 * This map allows looking up images by their key.
 */
export const EXERCISE_IMAGES: Record<string, any> = {
  benchpress: require("@/assets/images/benchpress.png"),
  pushups: require("@/assets/images/pushups.png"),
  "weighted-dips": require("@/assets/images/weighted-dips.png"),
  dips: require("@/assets/images/dips.png"),
  overheadpress: require("@/assets/images/overheadpress.png"),
  "pike-pushups": require("@/assets/images/pike-pushups.png"),
  "bw-pullups": require("@/assets/images/bw-pullups.png"),
  deadlift: require("@/assets/images/deadlift.png"),
  plank: require("@/assets/images/plank.png"),
  hollowbody: require("@/assets/images/hollowbody.png"),
};

/**
 * Get exercise image source by key
 * @param imageKey - The image key (without path/extension), e.g. "benchpress"
 * @returns Image source for use with expo-image or null if not found
 */
export function getExerciseImage(imageKey: string | undefined): any | null {
  if (!imageKey) return null;
  return EXERCISE_IMAGES[imageKey] ?? null;
}
