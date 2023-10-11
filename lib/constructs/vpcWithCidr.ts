import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class Network extends Construct {
    // Constructの外部からVPCにアクセス可能
    public readonly vpc: ec2.Vpc;
    public readonly pubSub01: ec2.PublicSubnet;
    public readonly pubSub02: ec2.PublicSubnet;
    public readonly priSub01: ec2.PrivateSubnet;
    public readonly priSub02: ec2.PrivateSubnet;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // VPCの作成
        const vpc = new ec2.Vpc(this, "VPC", {
            ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
            // vpcName: best practiceはつけない？？
            maxAzs: 2,
            subnetConfiguration: [],
            natGateways: 0,
            createInternetGateway: true,
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });
        this.vpc = vpc;

        // Internet Gatewayの作成
        const igw = new ec2.CfnInternetGateway(this, 'InternetGateway', {
        });

        new ec2.CfnVPCGatewayAttachment(this, "IGWAttachment", {
            vpcId: vpc.vpcId,
            internetGatewayId: igw.ref,
        });

        // pubSub01の作成
        const pubSub01 = new ec2.PublicSubnet(this, `pubSub01`, {
            vpcId: vpc.vpcId,
            availabilityZone: vpc.availabilityZones[0],
            cidrBlock: "10.0.1.0/24",
            mapPublicIpOnLaunch: true,
        });
        pubSub01.addRoute('addRoutePubSub01', {
            routerType: ec2.RouterType.GATEWAY,
            routerId: igw.ref,
        });
        this.pubSub01 = pubSub01;


        // PublicSubnet02の作成
        const pubSub02 = new ec2.PublicSubnet(this, `pubSub02`, {
            vpcId: vpc.vpcId,
            availabilityZone: vpc.availabilityZones[1],
            cidrBlock: "10.0.2.0/24",
            mapPublicIpOnLaunch: true,
        });
        pubSub02.addRoute('addRoutePubSub02', {
            routerType: ec2.RouterType.GATEWAY,
            routerId: igw.ref,
        });
        this.pubSub02 = pubSub02;

        // PriSub01の作成
        const priSub01 = new ec2.PrivateSubnet(this, `priSub01`, {
            vpcId: vpc.vpcId,
            availabilityZone: vpc.availabilityZones[0],
            cidrBlock: "10.0.3.0/24",
            mapPublicIpOnLaunch: false,
        });
        this.priSub01 = priSub01;

        // PriSub01の作成
        const priSub02 = new ec2.PrivateSubnet(this, `priSub02`, {
            vpcId: vpc.vpcId,
            availabilityZone: vpc.availabilityZones[1],
            cidrBlock: "10.0.4.0/24",
            mapPublicIpOnLaunch: false,
        });
        this.priSub02 = priSub02;


        // SSM 用のエンドポイントの作成
        vpc.addInterfaceEndpoint('SSMEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.SSM,
            subnets: {
                subnets: [pubSub01, pubSub02]
            }
        });
        vpc.addInterfaceEndpoint('EC2MessagesEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
            subnets: {
                subnets: [pubSub01, pubSub02]
            }
        });
        vpc.addInterfaceEndpoint('SSMMessagesEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            subnets: {
                subnets: [pubSub01, pubSub02]
            }
        });
        vpc.addGatewayEndpoint("S3Endpoint", {
            service: ec2.GatewayVpcEndpointAwsService.S3,
            subnets: [{
                subnets: [priSub01, priSub02]
            }]
        });
    }
}