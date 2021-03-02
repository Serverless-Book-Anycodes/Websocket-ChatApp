import oss2
import json
import base64
from apigateway import client
from apigateway.http import request
from apigateway.common import constant

ossClient = oss2.Bucket(oss2.Auth('<AccessKeyID>', '<AccessKeySecret>'),
                        'http://oss-cn-hongkong.aliyuncs.com',
                        '<BucketName>')
apigatewayClient = client.DefaultClient(app_key="<app_key>",
                                        app_secret="<app_secret>")


def register(event, context):
    userId = json.loads(event.decode("utf-8"))['headers']['x-ca-deviceid']
    # 注册的时候，将链接写入到对象存储
    ossClient.put_object(userId, 'user-id')
    # 返回客户端注册结果
    return {
        'isBase64Encoded': 'false',
        'statusCode': '200',
        'body': {
            'userId': userId
        },
    }


def send(event, context):
    host = "http://websocket.serverless.fun"
    url = "/notify"
    userId = json.loads(event.decode("utf-8"))['headers']['x-ca-deviceid']

    # 获取链接对象
    for obj in oss2.ObjectIterator(ossClient):
        if obj.key != userId:
            req_post = request.Request(host=host,
                                       protocol=constant.HTTP,
                                       url=url,
                                       method="POST",
                                       time_out=30000,
                                       headers={'x-ca-deviceid': obj.key})
            req_post.set_body(json.dumps({
                "from": userId,
                "message": base64.b64decode(json.loads(event.decode("utf-8"))['body']).decode("utf-8")
            }))
            req_post.set_content_type(constant.CONTENT_TYPE_STREAM)
            result = apigatewayClient.execute(req_post)
            print(result)
            if result[0] != 200:
                # 删除链接记录
                ossClient.delete_object(obj.key)
    return {
        'isBase64Encoded': 'false',
        'statusCode': '200',
        'body': {
            'status': "ok"
        },
    }


def clean(event, context):
    userId = json.loads(event.decode("utf-8"))['headers']['x-ca-deviceid']
    # 删除链接记录
    ossClient.delete_object(userId)
