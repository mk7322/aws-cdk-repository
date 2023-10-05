import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from './constructs/vpc-with-cidr'
// import { Network } from './constructs/vpc-without-cidr' // CIDR指定有無

export class AwsCdkRepoStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const network = new Network(this, "Network");

	}
}
