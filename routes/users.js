const router = require('express').Router();

router.get('/', (request, response) => {
  response.send("hey it's user route")
})

module.exports = router;
