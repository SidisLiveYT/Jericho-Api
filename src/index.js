function Work(string) {
  if (typeof string !== 'string') throw new TypeError('Work wants a string!');
  return true;
}
export default Work;
