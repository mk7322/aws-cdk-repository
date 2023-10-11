import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class Network extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Internet Gatewayの作成
        const igw = new ec2.CfnInternetGateway(this, 'InternetGateway');

        // VPCの作成
        const vpc = new ec2.Vpc(this, "VPC", {
            ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"), // cidr: '10.0.0.0/16'はdeprecated
            // vpcName: best practiceはつけない？？
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PUBLIC,
                    name: "Public"
                },
                {
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    name: "Private"
                },
                {
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    name: "Private"
                },
            ],
            natGateways: 0,
            createInternetGateway: true,
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });

        // SSM 用のエンドポイントの作成　サブネット指定が必要
        // vpc.addInterfaceEndpoint('SSMEndpoint', {
        //     service: ec2.InterfaceVpcEndpointAwsService.SSM,
        // });
        // vpc.addInterfaceEndpoint('EC2MessagesEndpoint', {
        //     service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
        // });
        // vpc.addInterfaceEndpoint('SSMMessagesEndpoint', {
        //     service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
        // });
        // vpc.addGatewayEndpoint("S3Endpoint", {
        //     service: ec2.GatewayVpcEndpointAwsService.S3,
        // });
    }
}