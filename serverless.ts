import type { AWS } from '@serverless/typescript';

const BUCKET_NAME = 'citypantry-bug-screenshots';

const serverlessConfiguration: AWS = {
  service: 'citypantry-error-plugin',
  frameworkVersion: '2',
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    bucket: BUCKET_NAME,
  },
  provider: {
    profile: 'citypantry',
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-2',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
    memorySize: 256,
    timeout: 30,
    iamRoleStatements: [
      /*    interface IamRoleStatement {
            Effect: 'Allow' | 'Deny';
            Sid?: string;
            Condition?: {
                [key: string]: any;
            };
            Action?: string | string[] | { [key: string]: any };
            NotAction?: string | string[] | { [key: string]: any };
            Resource?: string | string[] | { [key: string]: any };
            NotResource?: string | string[] | { [key: string]: any };
        }*/
      {
        Effect: 'Allow',
        Action: 's3:PutObject',
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }
    ]
  },
  functions: {
    report: {
      handler: `backend/handlers/report.main`,
      timeout: 30,
      events: [
        {
          http: {
            method: 'post',
            path: 'report',
            cors: true,
          }
        },
      ]
    },
    webhook: {
      handler: 'backend/handlers/webhook.main',
      timeout: 30,
      events: [
        {
          http: {
            method: 'post',
            path: 'webhook',
            cors: true,
          }
        },
      ]
    },
  }
}

module.exports = serverlessConfiguration;
