const mongoose = require('mongoose');


module.exports = {
  /**
   * @param uri
   * the uri of the database which is static
   * and stored in the .env file
   */
  connect: async (uri) => {
    mongoose
      .connect(uri)
      .then(() => {
        console.log('Connected to the database ');
      })
      .catch((err) => {
        console.error(`Error connecting to the database. n${err}`);
        db.connect(uri);
      });
  },
};