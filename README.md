# 帮助文档

- 配套章节：Serverless与Websocket的聊天工具
- 函数计算使用方法：需要自行配置对象存储和API网关配置:
```python
ossClient = oss2.Bucket(oss2.Auth('<AccessKeyID>', '<AccessKeySecret>'),
                        'http://oss-cn-hongkong.aliyuncs.com',
                        '<BucketName>')
apigatewayClient = client.DefaultClient(app_key="<app_key>",
                                        app_secret="<app_secret>")
```
- 前端使用方法:
```
$ npm install
$ npm run dist
$ open index.html
```