#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkRepoStack } from '../lib/aws-cdk-repo-stack';

const app = new cdk.App();
new AwsCdkRepoStack(app, 'AwsCdkRepoStack');