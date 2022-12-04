export interface DriveConfigParams {
  googleAccessToken?: string;
  driveFolderName?: string;
  driveFileName?: string;
}
export interface AWSConfigParams {
  accessKeyId: string;
  secretAccesskey: string;
  signatureVersion: 'v4';
  bucket: string;
  fileName?: string;
}
export interface ConfigureParams {
  drive?: DriveConfigParams;
  numberOfShares: number;
  threshold: number;
}
export interface SplitKeyParams {
  secret: string;
  n: number;
  k: number;
}
export interface SplitKeyRes {
  dealer_share: string;
  parties_share: string[];
  accounts: string[];
}
export interface CombineKeyParams {
  owner_share: {x: string, y:string};
  parties_share: Array<string>;
}
export interface UploadParams extends ConfigureParams {
  privateKey: string[];
  accounts: string[];
  emailaddrs: { id: number; email: string; }[];
}
export interface uploadRecollectParams {
  drive?: DriveConfigParams;
  emailaddrs: { id: number; email: string; }[];
}
export interface UploadKeyToDriveParams {
  secretPart: SplitKeyRes[];
  accounts: string[];
  token: string;
  folderName: string;
  fileName: string[];
  emailaddrs: { id: number; email: string; }[];
}
export interface UploadRecollectToDriveParams {
  token: string;
  folderName: string;
  fileName: string[];
  emailaddrs: { id: number; email: string; }[];
}

export interface shareFileType {
  fileId: string;
  emailaddr: string;
  token: string;
}

export interface shareFileResponseType {
  id: any;
}

export interface RecoveryParams extends ConfigureParams {
  recoveryShards?: string[];
}
export interface recoveryKeyFromDriveParams {
  token: string;
  folderName: string;
  fileName: string;
}
export declare type TokenType = {
  token: string;
};
export declare type CreateFolderType = TokenType & {
  folderName: string;
};
export declare type CreateFolderResponseType = {
  id: string;
  name: string;
};
export declare type CreateFileType = TokenType & {
  filename: string;
  folderId?: string;
};
export declare type CreateFileResponseType = {
  id: string;
  name: string;
};
export declare type GetFolderType = TokenType;
export declare type GetFolderResponseType = Array<{
  id: string;
  name: string;
}>;
export declare type GetFileType = TokenType;
export declare type GetFileResponseType = Array<{
  id: string;
  name: string;
}>;
export declare type GetFileAndFolderType = TokenType;
export declare type GetFileAndFolderResponseType = Array<{
  id: string;
  name: string;
  type: 'file' | 'folder';
  isTrashed: boolean;
  shared: boolean;
  Owner: string;
}>;
export declare type UpdateFileDataType = TokenType & {
  fileId: string;
  body: object;
};
export declare type UpdateFileDataResponseType = {
  id: string;
  name: string;
};
export declare type GetFileDataType = TokenType & {
  fileId: string;
};
export declare type GetFolderDataType = TokenType & {
  folderId: string;
};
export declare type GetFileDataResponseType = {
  data: {share:String, accounts:string[], Instruction_for_receiver:String, Saved: Boolean, Owner: string};
};
