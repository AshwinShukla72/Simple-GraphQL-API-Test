const graphql = require('graphql')
var _ = require('lodash');
const axios = require('axios');
const { req, res } = require('express')
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLError, GraphQLList, GraphQLNonNull } = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    companyId: { type: GraphQLString },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve: (parentValue, args) => axios.get(`http:localhost:3000/company/${parentValue.id}/users`).then(res => res.data).then(data => data)
    }
  })
})
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve: (parentValue, args) => {
        return axios.get(`http://localhost:3000/company/${parentValue.companyID}`).then(res => res.data).then(data => data)
      }
    }
  })
});
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLString },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyID: { type: GraphQLString }
      },
      resolve: (parentValue, { firstName, age }) => {
        console.log(firstName, age)
        return axios.post(`http://localhost:3000/users`, { firstName, age }).then(res => res.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parentValue, { id }) => {
        return axios.delete(`http://localhost:3000/users/${id}`).then(res => res.data)
      }
    },
    editUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        id: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt }
      },
      resolve: (parentValue, { firstName, lastName, id, age }) => axios.put(`http://localhost:3000/users/${id}`, { firstName, lastName, age }).then(res => res.data)
    }
  }
})

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`).then(res => res.data).then(data => data)
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/company/${args.id}`).then(res => res.data)
      }
    }
  }
}
)

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation
})
