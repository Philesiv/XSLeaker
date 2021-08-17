// server starting point

const app = require('./app');
require('./websocket');
require('./utils/db-manager');
// start express
const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
