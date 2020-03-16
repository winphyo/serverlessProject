import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS  from 'aws-sdk'  //default
import * as AWSXRay from 'aws-xray-sdk' //default

const todoTable = process.env.TODO_TABLE 
const XAWS = AWSXRay.captureAWS(AWS)  //default
const docClient = new XAWS.DynamoDB.DocumentClient()  //default

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  console.log('Processing event: ', event)
  console.log('Processing event: ', updatedTodo)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  await  updateTodo(todoId,updatedTodo)
  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
  
}

 async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest){

  console.log("Updating todo:", {
      todoId: todoId,
      updatedTodo: updatedTodo
  });
  await docClient.update({
      TableName: todoTable,
      Key: {
          "todoId": todoId
      },
      UpdateExpression: "set #todoName = :name, done = :done, dueDate = :dueDate",
      ExpressionAttributeNames: {
          "#todoName": "name"
      },
      ExpressionAttributeValues: {
          ":name": updatedTodo.name,
          ":done": updatedTodo.done,
          ":dueDate": updatedTodo.dueDate
      }
  }).promise()

  console.log("Update complete.")

}
