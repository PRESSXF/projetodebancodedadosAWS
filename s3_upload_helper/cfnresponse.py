# cfnresponse.py

import json
import urllib.request, urllib.error, urllib.parse

SUCCESS = "SUCCESS"
FAILED = "FAILED"

def send(event, context, responseStatus, responseData, physicalResourceId=None, noEcho=False, reason=None):
    responseUrl = event['ResponseURL']

    print(responseUrl)

    responseBody = {
        'Status': responseStatus,
        'Reason': reason or "See the details in CloudWatch Log Stream: " + context.log_stream_name,
        'PhysicalResourceId': physicalResourceId or context.log_stream_name,
        'StackId': event['StackId'],
        'RequestId': event['RequestId'],
        'LogicalResourceId': event['LogicalResourceId'],
        'NoEcho': noEcho,
        'Data': responseData
    }

    json_responseBody = json.dumps(responseBody)

    print("Response body:\n" + json_responseBody)

    headers = {
        'content-type': '',
        'content-length': str(len(json_responseBody))
    }

    try:
        req = urllib.request.Request(responseUrl, data=json_responseBody.encode('utf-8'), headers=headers, method='PUT')
        with urllib.request.urlopen(req) as response:
            # CORRIGIDO: Convertendo o retorno de getcode() para string
            print("Status code: " + str(response.getcode())) 
    except urllib.error.URLError as e:
        print("send(..) failed executing urllib.request.urlopen(..): " + str(e))