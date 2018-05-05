export default {
  create: {
    fetch(req, res, context) {
      // manipulate the fetch call
      return context.continue;
    },
  },
  list: {
    write: {
      before(req, res, context) {
        // modify data before writing list data
        return context.continue;
      },
      action(req, res, context) {
        // change behavior of actually writing the data
        return context.continue;
      },
      after(req, res, context) {
        // set some sort of flag after writing list data
        return context.continue;
      },
    },
  },
};
