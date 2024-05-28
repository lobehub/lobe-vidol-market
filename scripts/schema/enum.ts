import {z} from "zod";

/**
 * Category Enum, 当前包括 Anime, Game, Realistic, VTuber, Book, History, Movie, Animal, Vroid, Other
 */
export const CategoryEnum = z.enum([
  "Anime",
  "Game",
  "Realistic",
  "VTuber",
  "Book",
  "History",
  "Movie",
  "Animal",
  "Vroid",
   "Other"
]);

export const GenderEnum = z.enum([
  "Male",
  "Female",
  "Other"
]);

export const EmotionEnum = z.enum([
  "happy",
  "angry",
  "sad",
  "surprised",
  "relaxed",
  "neutral",
  "blink",
  "blinkLeft",
  "blinkRight",
]);