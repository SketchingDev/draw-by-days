import { CloudFormation } from "aws-sdk";

export interface ServiceDeployment {
  imageInfoTable?: string;
  imageStorageBucket?: string;
}

export const extractServiceOutputs = async (
  stackName: string,
  cloudFormation: CloudFormation
): Promise<ServiceDeployment> => {
  const stacks = await cloudFormation
    .describeStacks({ StackName: stackName })
    .promise();

  const serviceDeployment: ServiceDeployment = {};

  stacks.Stacks?.forEach(({ Outputs }) => {
    Outputs?.forEach(o => {
      switch (o.OutputKey) {
        case "ImageStorageBucket":
          serviceDeployment.imageStorageBucket = o.OutputValue;
          break;
        case "ImageInfoTable":
          serviceDeployment.imageInfoTable = o.OutputValue;
          break;
      }
    });
  });

  return serviceDeployment;
};
