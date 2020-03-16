import 'source-map-support/register'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserIdFromEvent } from '../../auth/utils'

const todoTable = process.env.TODO_TABLE
const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  console.log('Processing event: ', event)
  console.log('Processing newTodo: ', newTodo)
  const userId = getUserIdFromEvent(event);
  const todoId = await createTodo(userId, newTodo);
  
  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    body: JSON.stringify({
      todoId: todoId,
      ...newTodo
    })

}

 async function createTodo (userId: string, newTodo: CreateTodoRequest): Promise<string> {
  const todoId = uuid.v4();

  const newTodoWithAdditionalInfo = {
      userId: userId,
      todoId: todoId,
      ...newTodo
  }

  await docClient.put({
      TableName: todoTable,
      Item: newTodoWithAdditionalInfo
  }).promise();

  console.log("Create complete.")

  return todoId;

}

}