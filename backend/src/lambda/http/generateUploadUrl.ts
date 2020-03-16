import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const todoTable = process.env.TODO_TABLE
const bucketName = process.env.TODOITEM_S3_BUCKET_NAME
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const docClient = new XAWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const todoId = event.pathParameters.todoId
  console.log('Processing event: ', event)
  const imageId = uuid.v4();
  const uploadUrl = getUploadUrl(imageId)
  await updateTodoAttachmentUrl(todoId,uploadUrl)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}

function getUploadUrl(imageId: string) {
  //Get Sign URL 
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}

async function updateTodoAttachmentUrl(todoId: string, attachmentUrl: string){
  console.log('Storing new item: ', attachmentUrl)
   docClient.update({
      TableName: todoTable,
      Key: {
          "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl
      }
  }).promise();
  console.log('Storing new item completed')
}

