import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from './vpcWithCidr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface Ec2Props {
    vpc: ec2.Vpc;
    priSub01: ec2.PrivateSubnet;
    priSub02: ec2.PrivateSubnet;
    // instanceCount: number;
    ec2Sg: ec2.SecurityGroup;
}

export class Ec2 extends Construct {
    public readonly instance01: ec2.Instance;
    public readonly instance02: ec2.Instance;
    public readonly ec2Sg: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: Ec2Props) {
        super(scope, id);

        // PHP 8.2をインストールするユーザデータ例
        // const userData = ec2.UserData.forLinux({ shebang: '#!/bin/bash' });
        // userData.addCommands(
        //     'sudo yum update -y',
        //     'sudo yum localinstall -y https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm',
        //     'sudo yum-config-manager --disable mysql57-community',
        //     'sudo yum-config-manager --enable mysql80-community',
        //     'sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022',
        //     'sudo yum install -y mysql-community-client',
        //     'sudo yum install -y git',
        //     'sudo amazon-linux-extras install -y php8.2',
        //     'sudo yum install -y php-cli php-fpm php-json php-pdo php-mysqlnd php-zip php-gd php-mbstring php-curl php-xml php-pear php-bcmath'
        // );


        // プライベートサブネット内のEC2インスタンス01の作成
        const instance01 = new ec2.Instance(this, 'EC2-01', {
            vpc: props.vpc,
            instanceType: new ec2.InstanceType('t2.micro'),
            machineImage: ec2.MachineImage.lookup({
                name: 'amzn2-ami-hvm-*',
                owners: ['amazon'],
            }),
            vpcSubnets: {
                subnets: [props.priSub01]
            },
            ssmSessionPermissions: true,
            // role: role,
            securityGroup: props.ec2Sg,
            // userData: userData,
        });
        this.instance01 = instance01;

        // プライベートサブネット内のEC2インスタンス02の作成
        const instance02 = new ec2.Instance(this, 'EC2-02', {
            vpc: props.vpc,
            instanceType: new ec2.InstanceType('t2.micro'),
            machineImage: ec2.MachineImage.lookup({
                name: 'amzn2-ami-hvm-*',
                owners: ['amazon'],
            }),
            vpcSubnets: {
                subnets: [props.priSub02]
            },
            ssmSessionPermissions: true,
            // role: role,
            securityGroup: props.ec2Sg,
            // userData: userData,
        });
        this.instance02 = instance02;



        // n個のインスタンスを作成
        // const subnets = [props.priSub01, props.priSub02]

        // for (let i = 0; i < props.instanceCount; i++) {
        //     new ec2.Instance(this, `EC2-${i + 1}`, {
        //         vpc: props.vpc,
        //         instanceType: new ec2.InstanceType('t2.micro'),
        //         machineImage: ec2.MachineImage.lookup({
        //             name: 'amzn2-ami-hvm-*',
        //             owners: ['amazon'],
        //         }),
        //         vpcSubnets: {
        //             subnets: [subnets[i % subnets.length]]
        //         },
        //         ssmSessionPermissions: true,
        //         // role: role,
        //         // securityGroup: ,
        //         // userData: userData,
        //     });

    }
}