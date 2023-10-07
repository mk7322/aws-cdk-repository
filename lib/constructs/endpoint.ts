import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from './vpcWithCidr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface EndpointProps {
    vpc: ec2.Vpc;
    priSub01: ec2.PrivateSubnet;
    priSub02: ec2.PrivateSubnet;
}

export class Endpoint extends Construct {
    constructor(scope: Construct, id: string, props: EndpointProps) {
        super(scope, id);

        // SSM 用のエンドポイントの作成
        new ec2.InterfaceVpcEndpoint(this, "EC2MessagesEndpoint", {
            vpc: props.vpc,
            service: new ec2.InterfaceVpcEndpointAwsService("ec2messages"),
            subnets: {
                subnets: [props.priSub01, props.priSub02]
            }
        });
        new ec2.InterfaceVpcEndpoint(this, "SSMEndpoint", {
            vpc: props.vpc,
            service: new ec2.InterfaceVpcEndpointAwsService("ssm"),
            subnets: {
                subnets: [props.priSub01, props.priSub02]
            }
        });
        new ec2.InterfaceVpcEndpoint(this, "SSMMessagesEndpoint", {
            vpc: props.vpc,
            service: new ec2.InterfaceVpcEndpointAwsService("ssmmessages"),
            subnets: {
                subnets: [props.priSub01, props.priSub02]
            }
        });
    }
}