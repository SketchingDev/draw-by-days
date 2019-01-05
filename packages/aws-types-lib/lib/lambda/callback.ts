import { Callback } from "aws-lambda";

export type ResultCallback = Callback<{ result: string; message: string } | null>;
