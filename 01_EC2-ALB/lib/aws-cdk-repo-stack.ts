import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from './constructs/vpcWithCidr';
// import { Network } from './constructs/vpcWithoutCidr'; // CIDR指定有無
import { Ec2, Ec2Props } from './constructs/ec2InPri';
import { Alb } from './constructs/alb';
import { Sg } from './constructs/sg';
import { S3 } from './constructs/s3';

export class AwsCdkRepoStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		/* ALB - EC2 構成 */
		// VPCやサブネット、エンドポイント
		// const network = new Network(this, "Network");

		// // SG
		// const securityGroup = new Sg(this, "SecurityGroup", {
		// 	vpc: network.vpc,
		// });

		// // S3
		// const s3 = new S3(this, "ALBLogBucket", {
		// 	vpc: network.vpc,
		// });

		// // EC2
		// const ec2 = new Ec2(this, "EC2", {
		// 	vpc: network.vpc,
		// 	priSub01: network.priSub01,
		// 	priSub02: network.priSub02,
		// 	// instanceCount: 6,
		// 	ec2Sg: securityGroup.ec2Sg,
		// });

		// // ALB
		// const alb = new Alb(this, "LB", {
		// 	vpc: network.vpc,
		// 	pubSub01: network.pubSub01,
		// 	pubSub02: network.pubSub02,
		// 	// instanceCount: 6,
		// 	instance01: ec2.instance01,
		// 	instance02: ec2.instance02,
		// 	albSg: securityGroup.albSg,
		// 	albLogBucket: s3.albLogBucket,
		// });


		/* CloudFront - S3 構成 */


	}
}
