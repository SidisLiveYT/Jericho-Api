module.exports = function Wrork(string) {
    if (typeof string !== "string") throw new TypeError("Work Function wants a string!");
    return string.replace(/\s/g, "");
  };