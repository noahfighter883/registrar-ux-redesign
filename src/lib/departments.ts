export type Division = "Arts & Humanities" | "Sciences & Mathematics" | "Social Sciences";

export type Department = {
  name: string;
  code: string;
  division: Division;
  subCodes?: { code: string; label: string }[];
};

export const DEPARTMENTS: Department[] = [
  { name: "American Studies", code: "AM", division: "Social Sciences" },
  { name: "Anthropology", code: "AN", division: "Social Sciences" },
  { name: "Art", code: "AR", division: "Arts & Humanities" },
  { name: "Art History", code: "AH", division: "Arts & Humanities" },
  { name: "Biology", code: "BI", division: "Sciences & Mathematics" },
  { name: "Business", code: "MB", division: "Social Sciences" },
  { name: "Chemistry", code: "CH", division: "Sciences & Mathematics" },
  { name: "Computer Science", code: "CS", division: "Sciences & Mathematics" },
  {
    name: "Dance",
    code: "DN",
    division: "Arts & Humanities",
    subCodes: [
      { code: "DN-BAL", label: "Ballet" },
      { code: "DN-MOD", label: "Modern" },
      { code: "DN-CHO", label: "Choreography" },
    ],
  },
  { name: "Economics", code: "EC", division: "Social Sciences" },
  { name: "English", code: "EN", division: "Arts & Humanities" },
  { name: "Environmental Studies", code: "ES", division: "Sciences & Mathematics" },
  { name: "Mathematics", code: "MA", division: "Sciences & Mathematics" },
  { name: "Music", code: "MU", division: "Arts & Humanities" },
  { name: "Philosophy", code: "PH", division: "Arts & Humanities" },
  { name: "Physics", code: "PS", division: "Sciences & Mathematics" },
  { name: "Psychology", code: "PY", division: "Social Sciences" },
  {
    name: "World Languages & Literatures",
    code: "WL",
    division: "Arts & Humanities",
    subCodes: [
      { code: "WL-FR", label: "French" },
      { code: "WL-SP", label: "Spanish" },
      { code: "WL-GR", label: "German" },
      { code: "WL-IT", label: "Italian" },
      { code: "WL-JP", label: "Japanese" },
    ],
  },
];

export const TERMS = [
  { id: "202680", label: "Fall 2026", isCurrent: true },
  { id: "202710", label: "Spring 2027" },
  { id: "202620", label: "Summer 2026" },
  { id: "202580", label: "Fall 2025" },
  { id: "202510", label: "Spring 2026" },
];
