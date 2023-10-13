#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { S3CFntStack } from '../lib/03_s3-cloud_front-stack';

const app = new cdk.App();
new S3CFntStack(app, 'S3CFntStack', {
  env: {
    account: 'XXXXXXXXXXXX',
    region: 'ap-northeast-1',
  }
});