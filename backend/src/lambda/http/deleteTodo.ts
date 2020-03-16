import 'source-map-support/register'
import * as AWS  from 'aws-sdk'  //default
import * as AWSXRay from 'aws-xray-sdk' //default

const todoTable = process.env.TODO_TABLE 
const XAWS = AWSXRay.captureAWS(AWS)  //default
const docClient = new XAWS.DynamoDB.DocumentClient()  //default

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log('Processing event: ', event)
  await deleteTodo(todoId);
  // TODO: Remove a TODO item by id
  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({})
  }
}


async function deleteTodo(todoId: string) {
  console.log("Deleting todo:", {todoId: todoId});
  await docClient.delete({
      TableName: todoTable,
      Key: {
          "todoId": todoId
      }
  }).promise();
}