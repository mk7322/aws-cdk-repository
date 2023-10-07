import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from './constructs/vpcWithCidr';
// import { Network } from './constructs/vpcWithoutCidr'; // CIDR指定有無
import { Ec2, Ec2Props } from './constructs/ec2InPri';
import { Alb } from './constructs/alb';
import { Sg } from './constructs/sg';
import { Endpoint } from './constructs/endpoint';

export class AwsCdkRepoStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const network = new Network(this, "Network");

		const securityGroup = new Sg(this, "SecurityGroup", {
			vpc: network.vpc,
		});

		const endpoint = new Endpoint(this, "Endpoint", {
			vpc: network.vpc,
			priSub01: network.priSub01,
			priSub02: network.priSub02,
		});

		const ec2 = new Ec2(this, "EC2", {
			vpc: network.vpc,
			priSub01: network.priSub01,
			priSub02: network.priSub02,
			// instanceCount: 6,
			ec2Sg: securityGroup.ec2Sg,
		});

		const alb = new Alb(this, "LB", {
			vpc: network.vpc,
			pubSub01: network.pubSub01,
			pubSub02: network.pubSub02,
			// instanceCount: 6,
			instance01: ec2.instance01,
			instance02: ec2.instance02,
			albSg: securityGroup.albSg,
		});

	}
}
