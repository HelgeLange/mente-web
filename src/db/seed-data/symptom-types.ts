// Spanish-first catalog of trackable perimenopause symptoms.
//
// Authored in Spanish, not translated from English. Marked [ES-DRAFT] if a
// native-Spanish content lead should still polish the wording. See MEN-3.
//
// Severity scale across all rows: 0 = ninguno, 1 = leve, 2 = moderado,
// 3 = intenso. Symptoms with `hasNumericValue` use `valueNumeric` instead of
// (or in addition to) severity — e.g. peso (kg), horas de sueño (h).

import type { NewSymptomType } from "./types";

export const symptomTypeSeed: NewSymptomType[] = [
  // Vasomotores
  {
    slug: "sofocos",
    labelEs: "Sofocos",
    category: "vasomotores",
    sortOrder: 10,
  },
  {
    slug: "sudores_nocturnos",
    labelEs: "Sudores nocturnos",
    category: "vasomotores",
    sortOrder: 20,
  },

  // Sueño
  {
    slug: "insomnio",
    labelEs: "Insomnio",
    category: "sueno",
    sortOrder: 10,
  },
  {
    slug: "despertares_nocturnos",
    labelEs: "Despertares nocturnos",
    category: "sueno",
    sortOrder: 20,
  },
  {
    slug: "horas_de_sueno",
    labelEs: "Horas de sueño",
    category: "sueno",
    sortOrder: 30,
    hasSeverity: false,
    hasNumericValue: true,
    numericUnit: "h",
  },

  // Estado de ánimo
  {
    slug: "ansiedad",
    labelEs: "Ansiedad",
    category: "estado_de_animo",
    sortOrder: 10,
  },
  {
    slug: "tristeza",
    labelEs: "Tristeza",
    category: "estado_de_animo",
    sortOrder: 20,
  },
  {
    slug: "irritabilidad",
    labelEs: "Irritabilidad",
    category: "estado_de_animo",
    sortOrder: 30,
  },
  {
    slug: "niebla_mental",
    labelEs: "Niebla mental",
    category: "estado_de_animo",
    sortOrder: 40,
  },

  // Ciclo
  {
    slug: "sangrado",
    // severity reflects abundance (1 = leve, 2 = moderado, 3 = abundante).
    labelEs: "Sangrado",
    category: "ciclo",
    sortOrder: 10,
  },
  {
    slug: "dolor_pelvico",
    labelEs: "Dolor pélvico",
    category: "ciclo",
    sortOrder: 20,
  },
  {
    slug: "sensibilidad_mamaria",
    labelEs: "Sensibilidad mamaria",
    category: "ciclo",
    sortOrder: 30,
  },

  // Cuerpo / energía
  {
    slug: "fatiga",
    labelEs: "Fatiga",
    category: "cuerpo",
    sortOrder: 10,
  },
  {
    slug: "dolor_articular",
    labelEs: "Dolor articular",
    category: "cuerpo",
    sortOrder: 20,
  },
  {
    slug: "dolor_de_cabeza",
    labelEs: "Dolor de cabeza",
    category: "cuerpo",
    sortOrder: 30,
  },
  {
    slug: "palpitaciones",
    labelEs: "Palpitaciones",
    category: "cuerpo",
    sortOrder: 40,
  },

  // Salud sexual
  {
    slug: "sequedad_vaginal",
    labelEs: "Sequedad vaginal",
    category: "salud_sexual",
    sortOrder: 10,
  },
  {
    slug: "libido_baja",
    // [ES-DRAFT] content lead may prefer "Deseo sexual bajo".
    labelEs: "Libido baja",
    category: "salud_sexual",
    sortOrder: 20,
  },

  // Peso
  {
    slug: "peso",
    labelEs: "Peso",
    category: "peso",
    sortOrder: 10,
    hasSeverity: false,
    hasNumericValue: true,
    numericUnit: "kg",
  },
];
