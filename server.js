require('dotenv').config()
const logger = require('morgan');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require("./schema/schema")
const app = express()
app.use(logger('dev'))


app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));
app.listen(process.env.PORT, () => {
  console.log("Server Started on PORT:", process.env.PORT)
})