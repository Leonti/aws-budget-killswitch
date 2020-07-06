const AWS = require('aws-sdk')

const cloudfront = new AWS.CloudFront()
const apigateway = new AWS.APIGateway()

const disableDistribution = async(id) => {
  const config = await cloudfront.getDistributionConfig({ Id: id }).promise()
  const disabledConfig = { ...config.DistributionConfig, Enabled: false }

  await cloudfront.updateDistribution({
    Id: id,
    DistributionConfig: disabledConfig,
    IfMatch: config.ETag
  }).promise()
}

const disableCloudfront = async() => {
  const distributions = await cloudfront.listDistributions().promise()
  await Promise.all(distributions.DistributionList.Items.map(d => disableDistribution(d.Id)))
}

const setStageLimits = async(restApiId, stageName) => {
  const stage = await apigateway.getStage({
    restApiId,
    stageName,
  }).promise()

  await apigateway.updateStage({
    restApiId,
    stageName,
    patchOperations: [{
        op: 'replace',
        path: '/*/*/throttling/burstLimit',
        value: '0'
      },
      {
        op: 'replace',
        path: '/*/*/throttling/rateLimit',
        value: '0'
      },
    ]
  }).promise()

  console.log(stage)
}

const disableApiGateways = async() => {
  const apiIds = (await apigateway.getRestApis().promise()).items.map(a => a.id)

  await Promise.all(apiIds.map(async(restApiId) => {
    const stages = (await apigateway.getStages({
      restApiId
    }).promise()).item

    await Promise.all(stages.map(stage => setStageLimits(restApiId, stage.stageName)))
  }))

}

exports.handler = async(event) => {
  await disableCloudfront()
  await disableApiGateways()
};