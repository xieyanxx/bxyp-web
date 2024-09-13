/**
 * @name 26个大写字母
 */
const UppercaseLetters = Array.from({ length: 26 }).map((_, i) =>
  String.fromCharCode(i + 65),
);

/**
 * @name 26个小写字母
 */
const LowercaseLetters = Array.from({ length: 26 }).map((_, i) =>
  String.fromCharCode(i + 97),
);

export { LowercaseLetters, UppercaseLetters };
