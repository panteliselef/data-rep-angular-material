declare global {
  interface String {
    capitalize(): string;
  }
}

String.prototype.capitalize = function(): string {
  return String(this).toLowerCase()
    .replace(/\w/, firstLetter => firstLetter.toUpperCase());
};

export {};
