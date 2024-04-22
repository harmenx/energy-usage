import decimal
import json
import boto3
import pandas as pd
from io import StringIO
import logging

s3 = boto3.client('s3',
                  aws_access_key_id='your_access_key_id',
                  aws_secret_access_key='your_secret_access_key',
                  endpoint_url='http://localhost:4566')
dynamodb = boto3.resource('dynamodb',            aws_access_key_id='your_access_key_id',
                  aws_secret_access_key='your_secret_access_key',endpoint_url='http://localhost:4566')

data_table = dynamodb.Table('data')
conversions_table = dynamodb.Table('conversions')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    logger.info('Lambda function invoked with event: %s', json.dumps(event))
    
    try:
   
      bucket = event['Records'][0]['s3']['bucket']['name']
      key = event['Records'][0]['s3']['object']['key']
      response = s3.get_object(Bucket=bucket, Key=key)
      data = response['Body'].read().decode('utf-8')
  
      conversion_factors = conversions_table.scan()['Items']

      conversion_df = pd.DataFrame(conversion_factors)
      data_df = pd.read_csv(StringIO(data))

      merged_df = pd.merge(data_df, conversion_df, on=['category', 'fuel_type'], how='left')
      merged_df['activity_value'] = merged_df['activity_value'].apply(decimal.Decimal)
      merged_df['kg_co2e_total'] = merged_df['activity_value'] * merged_df['total_kg_co2e_per_unit']
 
    
      merged_df['start_date'] = pd.to_datetime(merged_df['start_date_x'], format='%d/%m/%Y')
      merged_df['end_date'] = pd.to_datetime(merged_df['end_date_x'], format='%d/%m/%Y')

      monthly_totals = merged_df.groupby(merged_df['start_date'].dt.month)['kg_co2e_total'].sum().reset_index()
      yearly_totals = merged_df.groupby(merged_df['start_date'].dt.year)['kg_co2e_total'].sum().reset_index()

      result = {
          monthly_totals.to_json(),
          yearly_totals.to_json()
      }
    
      data_table.put_item(Item={
          'id': key,
          'carbon_emissions': result
      })
      return {
          'statusCode': 200,
          'body': json.dumps('Data processed and stored successfully')
      }
    except Exception as e:
      logger.error('An error occurred during processing: %s', e)
      return {
          'statusCode': 500,
          'body': json.dumps('Error processing the data file')
      }
  


mock_event = {
  "Records": [
    {
      "eventVersion": "2.1",
      "eventSource": "aws:s3",
      "awsRegion": "eu-west-1",
      "eventTime": "2024-04-21T12:34:56.789Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "AWS:EXAMPLE"
      },
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "responseElements": {
        "x-amz-request-id": "EXAMPLE123456789",
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "testConfigRule",
        "bucket": {
          "name": "sample-bucket",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          },
          "arn": "arn:aws:s3:::sample-bucket"
        },
        "object": {
          "key": "energy_fuel_usage.csv",
          "size": 1024,
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901"
        }
      }
    }
  ]
}

lambda_handler(mock_event, None)