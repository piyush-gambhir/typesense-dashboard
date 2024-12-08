import { env } from '@/env';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({
  region: env.AWS_REGION || 'us-east-1',
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export interface LambdaInvokeOptions<T> {
  functionName: string;
  payload: T;
}

export async function invokeLambda<TInput, TOutput>({
  functionName,
  payload,
}: LambdaInvokeOptions<TInput>): Promise<TOutput | undefined> {
  if (!functionName) {
    throw new Error('Function name is required');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a valid object');
  }

  const params = {
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload)),
  };

  try {
    const command = new InvokeCommand(params);
    const response = await lambdaClient.send(command);

    if (response.Payload) {
      return JSON.parse(Buffer.from(response.Payload).toString()) as TOutput;
    }
    return undefined;
  } catch (error) {
    console.error(`Error invoking Lambda: ${functionName}`, error);
    return undefined;
  }
}
