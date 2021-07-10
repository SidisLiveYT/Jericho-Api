module.exports = {
  ShuffleArray(Array) {
    let temp = 0;
    let place = 0;
    let count = 0;
    const Arrays = Array;
    for (count = Arrays.length - 1; count > 0; count -= 1) {
      place = Math.floor(Math.random() * (count + 1));
      temp = Arrays[count];
      Arrays[count] = Arrays[place];
      Arrays[place] = temp;
    }
    return Arrays;
  },
};
