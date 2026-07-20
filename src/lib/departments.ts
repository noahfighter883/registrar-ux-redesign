export type Department = {
  name: string;
  code: string;
  subCodes?: { code: string; label: string }[];
};

export const DEPARTMENTS: Department[] = [
  { name: "American Studies", code: "AM" },
  { name: "Anthropology", code: "AN" },
  { name: "Art", code: "AR" },
  { name: "Art History", code: "AH" },
  { name: "Biology", code: "BI" },
  { name: "Business", code: "MB" },
  { name: "Chemistry", code: "CH" },
  { name: "Computer Science", code: "CS" },
  {
    name: "Dance",
    code: "DN",
    subCodes: [
      { code: "DN-BAL", label: "Ballet" },
      { code: "DN-MOD", label: "Modern" },
      { code: "DN-CHO", label: "Choreography" },
    ],
  },
  { name: "Economics", code: "EC" },
  { name: "English", code: "EN" },
  { name: "Environmental Studies", code: "ES" },
  { name: "Mathematics", code: "MA" },
  { name: "Music", code: "MU" },
  { name: "Philosophy", code: "PH" },
  { name: "Physics", code: "PS" },
  { name: "Psychology", code: "PY" },
  {
    name: "World Languages & Literatures",
    code: "WL",
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
