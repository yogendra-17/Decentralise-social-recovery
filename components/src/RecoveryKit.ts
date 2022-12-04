import {
  createFile,
  createFolder,
  getFile,
  getFileData,
  getFolder,
  updateFileData,
  shareFile,
  getFilesAndFolderShared,
} from './driveEndpoints';
import {join, split} from './shamirSecret';

import {
  ConfigureParams,
  SplitKeyParams,
  CombineKeyParams,
  UploadKeyToDriveParams,
  recoveryKeyFromDriveParams,
  UploadParams,
  RecoveryParams,
  uploadRecollectParams,
  UploadRecollectToDriveParams,
  TokenType,
  GetFileDataType,
  GetFileDataResponseType,
  SplitKeyRes
} from './types';

class RecoveryKit {
  private config: ConfigureParams;
  recollectInstruction: String;
  shareInstruction: String;
  dealerFoldername: string;

  constructor() {
    this.config = {numberOfShares: 5,
                   threshold: 3};
    this.recollectInstruction = "Edit this file and insert the Share."
    this.shareInstruction = "Please make a copy and store this in your drive and set saved to 'true'."
    this.dealerFoldername = "SLDealer"
  }

  configure = (params: ConfigureParams) => {
    this.config = params;
  };

  private splitKey = async (params: SplitKeyParams): Promise<SplitKeyRes> => {
    const spl = await split(params.n, params.k, params.secret);
    let res: SplitKeyRes;
    res = {"dealer_share": JSON.stringify(spl["dealer_share"]),
          "parties_share": spl["parties_share"].map(r=>JSON.stringify(r)),
          accounts: []};
    return res;
  };

  private combineKey = (params: CombineKeyParams): string => {
    return join([params.owner_share], params.parties_share.map(r=>JSON.parse(r)));
  };

  private uploadKeyToDrive = async (params: UploadKeyToDriveParams) => {
    try {
      let folderId: string | undefined = undefined;
      const {token, folderName, fileName, secretPart} = params;
      const getFolderRes = await getFolder({
        token,
      });

      let dealerFolderId: string | undefined = undefined;
      if (getFolderRes.find(folder => folder.name === this.dealerFoldername)) {
        folderId = getFolderRes.find(folder => folder.name === this.dealerFoldername)!.id;
        console.log("I AM HERE");
      } else {
        const createFolderRes = await createFolder({
          token,
          folderName: this.dealerFoldername,
        });
        console.log("SLDealer created!")
        dealerFolderId = createFolderRes.id;
      }

      if (getFolderRes.find(folder => folder.name === folderName)) {
        folderId = getFolderRes.find(folder => folder.name === folderName)!.id;
      } else {
        const createFolderRes = await createFolder({
          token,
          folderName,
        });
        folderId = createFolderRes.id;
      }

      if (dealerFolderId) {
        const createFileRes = await createFile({
          token,
          filename: "dealer_share",
          folderId: dealerFolderId,
        });
        if (createFileRes.id) {
          let dealer_share = [];
          for (let i=0; i<secretPart.length; i++) {
            dealer_share.push(secretPart[i].dealer_share);
          }
          let data = {share: dealer_share,
                      accounts: params.accounts,
                      Hints: params.emailaddrs.map(r=>r.email.split(/[\\s@&.?$+-_]+/)[0])}

          await updateFileData({token,
                                fileId: createFileRes.id,
                                body: data});
        } else {
          throw new Error('File not found, not created');
        }
      }
      else {
        throw new Error("Dealer's folder not found, not created");
      }

      if (folderId) {
        let fileId: string | undefined = undefined;
        const getFilesRes = await getFile({token});
        for(let i=0; i<fileName.length; i++)
        {
          if (getFilesRes.find(file => file.name === fileName[i])) {
            fileId = getFilesRes.find(file => file.name === fileName[i])!.id;
          } else {
            let filename = fileName[i]
            console.log('Creating ', filename);
            const createFileRes = await createFile({
              token,
              filename,
              folderId,
            });
            fileId = createFileRes.id;
          }
          if (fileId) {
            let parties_share = [];
            for (let j=0; j<secretPart.length; j++) {
              parties_share.push(secretPart[j].parties_share[i]);
            }
            let data = {share: parties_share, Instruction_for_receiver: this.shareInstruction, Saved: false};
            await updateFileData({token, fileId, body: data});
          } else {
            throw new Error('File not found, not created');
          }
          const emailaddr = params.emailaddrs[i].email;
          const shareFileres = await shareFile({fileId, emailaddr, token});
          console.log("File sent!");
          console.log(shareFileres);
        }
      } else {
        throw new Error('Folder not found, not created');
      }
    } catch (error) {
      throw new Error(error as string);
    }
  };

  private uploadRecollectToDrive = async (params: UploadRecollectToDriveParams) => {
    try {
      let folderId: string | undefined = undefined;
      const {token, folderName, fileName} = params;
      const files = await getFilesAndFolderShared({token})
      const sharedfile = files.filter((a) => {return a.shared === true && a.name.startsWith("shareRecollect");});
      console.log("files are ", sharedfile);
      const getFolderRes = await getFolder({
        token,
      });

      if (getFolderRes.find(folder => folder.name === folderName)) {
        folderId = getFolderRes.find(folder => folder.name === folderName)!.id;
      } else {
        const createFolderRes = await createFolder({
          token,
          folderName,
        });
        folderId = createFolderRes.id;
      }

      if (folderId) {
        let fileId: string | undefined = undefined;
        const getFilesRes = await getFile({token});
        for(let i=0; i<fileName.length; i++)
        {
          if (getFilesRes.find(file => file.name === fileName[i])) {
            fileId = getFilesRes.find(file => file.name === fileName[i])!.id;
          } else {
            let filename = fileName[i]
            console.log('Creating ', filename);
            const createFileRes = await createFile({
              token,
              filename,
              folderId,
            });
            fileId = createFileRes.id;
          }
          if (fileId) {
            let data = {share: '<Share goes here!>', Instruction_for_receiver: this.recollectInstruction, }
            await updateFileData({token, fileId, body: data});
          } else {
            throw new Error('File not found, not created');
          }
          const emailaddr = params.emailaddrs[i].email;
          const shareFileres = await shareFile({fileId, emailaddr, token});
          console.log("Recollect File sent!");
          console.log(shareFileres);
        }
      } else {
        throw new Error('Folder not found, not created');
      }
    } catch (error) {
      throw new Error(error as string);
    }
  };


  private recoveryKeyFromDrive = async (
    params: recoveryKeyFromDriveParams,
  ): Promise<SplitKeyRes> => {
    try {
      const {token, folderName, fileName} = params;
      let folderId: string | undefined = undefined;
      let dealerFolderId: string | undefined = undefined;
      const getFolderRes = await getFolder({
        token,
      });
      if (getFolderRes.find(folder => folder.name === folderName) && 
          getFolderRes.find(folder => folder.name === this.dealerFoldername)) {
        folderId = getFolderRes.find(folder => folder.name === folderName)!.id;
        dealerFolderId = getFolderRes.find(folder => folder.name === this.dealerFoldername)!.id;
      } else {
        throw new Error('Drive folder not found');
      }
      let result: SplitKeyRes = {dealer_share:'', parties_share: [], accounts: []};

      if (dealerFolderId) {
        let fileId: string;
        const getFiles = await getFile({token});
        const getDealerShare = getFiles.filter(file => file.name.startsWith('dealer_share'))
        fileId = getDealerShare[0].id;
        if (!getDealerShare.length) {
          throw new Error('Drive file not found');
        }
        else if (getDealerShare.length > 1) {
          throw new Error('Multiple Dealer Share exists!!');
        }
        const getFileDataRes = await getFileData({token, fileId});
        console.log("filedata dealer ", getFileDataRes.data.share);
        result.dealer_share = getFileDataRes.data.share.toString();
        result.accounts = getFileDataRes.data.accounts
      } else {
        throw new Error('Dealer folder not found');
      }

      if (folderId) {
        let fileIds: string[] = [];
        const getFilesRess = await getFile({token});
        const getFilesRes = getFilesRess.filter(file => file.name.startsWith('shareRecollect'))
        console.log('fileres is ',getFilesRes);
        for (let i = 0; i<getFilesRes.length; i++)
          fileIds.push(getFilesRes[i].id);

        if (!getFilesRes.length) {
          throw new Error('Drive file not found');
        }
        for (let i =0; i<fileIds.length; i++){
          if (fileIds[i]) {
            let fileId: string = fileIds[i];
            const getFileDataRes = await getFileData({token, fileId});
            result.parties_share.push(JSON.stringify(getFileDataRes.data.share));
          } else {
            throw new Error('Drive file not found');
          }
        }
        return result;
      } else {
        throw new Error('Drive folder not found');
      }
    } catch (error) {
      throw new Error(error as string);
    }
  };

  upload = async (params: UploadParams): Promise<Array<string>> => {
    try {
      const token =
        this.config.drive?.googleAccessToken ?? params.drive?.googleAccessToken;
      if (!token) {
        throw new Error('Not found Google Access Token');
      }
      const folderName = 'SLBackup';
      let fileName:string[] = [];
      // let unixtime = Date.now()
      for (let i = 0; i < params.numberOfShares; i++) {
        let tmp = "share" + i.toString(10) /*+ unixtime*/;
        fileName.push(tmp);
      }
      console.log(fileName);
      const {privateKey} = params;
      const {emailaddrs} = params;
      let keys:SplitKeyRes[] = [];
      for (let i=0; i<privateKey.length; i++) {
        let key = await this.splitKey({
          secret: privateKey[i],
          n: params.numberOfShares ?? this.config.numberOfShares ?? 3,
          k: params.threshold ?? this.config.threshold ?? 2,
        });
        keys.push(key);
      }
      console.log(keys)
      await this.uploadKeyToDrive({
        secretPart: keys,
        accounts: params.accounts,
        token,
        folderName,
        fileName,
        emailaddrs
      });
      return keys[0]["parties_share"].slice(1, keys[0]["parties_share"].length);
    } catch (error) {
      throw new Error(error as string);
    }
  };

  uploadRecollect = async (params: uploadRecollectParams): Promise<Boolean> => {
    try {
      const token =
        this.config.drive?.googleAccessToken ?? params.drive?.googleAccessToken;
      if (!token) {
        throw new Error('Not found Google Access Token');
      }
      const folderName = 'SLBackupRecollected';
      let fileName:string[] = [];
      for (let i = 0; i < params.emailaddrs.length; i++) {
        let tmp = "shareRecollect" + i.toString(10);
        fileName.push(tmp);
      }
      console.log(fileName);
      const {emailaddrs} = params;
      await this.uploadRecollectToDrive({
        token,
        folderName,
        fileName,
        emailaddrs
      });
      return true;
    } catch (error) {
      throw new Error(error as string);
    }
  };

  recovery = async (params: RecoveryParams) => {
    try {
      const token =
        this.config.drive?.googleAccessToken ?? params.drive?.googleAccessToken;
      const folderName =
        'SLBackupRecollected';
      const fileName =
        this.config.drive?.driveFileName ??
        params.drive?.driveFileName ??
        'SLBackupSecret';

      if (!token) {
        throw new Error('Not found Google Access Token');
      }

      const drivePart = await this.recoveryKeyFromDrive({
        token,
        folderName,
        fileName,
      });

      // let secret = [];
      let keys: SplitKeyRes = {dealer_share: '', parties_share: [], accounts: drivePart.accounts};
      for (let i = 0; i<drivePart.parties_share.length; i++) {
        const recObj = JSON.parse(drivePart.parties_share[i]);
        keys["parties_share"].push(recObj); 
      }
      keys["dealer_share"] = drivePart.dealer_share;
      let dealer_share_arr = JSON.parse('['+drivePart.dealer_share+']');

      console.log("arr is dealer ", dealer_share_arr);
      console.log("arr is dealer ", dealer_share_arr.length);

      console.log("arrparty is dealer ", keys.parties_share);

      console.log("arrparty is dealer ", keys.parties_share[0].length);
      let secrets = [];
      let secretI:CombineKeyParams[]=[];
      for (let i = 0; i < dealer_share_arr.length; i++) {
        let temp: CombineKeyParams = {owner_share: dealer_share_arr[i], parties_share:[]}
        for (let j = 0; j < keys.parties_share.length; j++) {
            temp.parties_share.push(keys.parties_share[j][i]);
        }
        secretI.push(temp);
        secrets.push(this.combineKey(temp));
      }
      return {secrets: secrets, accounts: keys.accounts};
    } catch (error) {
      throw new Error(error as string);
    }
  };

  pending = async (params: TokenType) => {
    try {
      const {token} = params;
      const files = await getFilesAndFolderShared({token})
      const sharedfile = files.filter((a) => {return a.shared === true && a.name.startsWith("share");});
      let result: {Owner:string, RequestType: string, fileId: string, filename: string}[] = [];
      for (let i = 0; i < sharedfile.length; i++) {
        const fileId = sharedfile[i].id;
        const getFileDataRes = await getFileData({token, fileId});
        if(getFileDataRes.data.Instruction_for_receiver == this.shareInstruction && !getFileDataRes.data.Saved) {
          result.push({Owner: sharedfile[i].Owner, RequestType: "wants to share a shard.", fileId:fileId, filename: sharedfile[i].name})
        }
        else if(getFileDataRes.data.Instruction_for_receiver == this.recollectInstruction) {
          result.push({Owner: sharedfile[i].Owner, RequestType: "wants their share back.", fileId:fileId, filename: sharedfile[i].name})
        }
      }
      return result;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  approve = async (params: GetFileDataType & {filename: string, Owner: string}) => {
    try {
      const {token, fileId, filename, Owner} = params;
      const folderName: string = "SLBackupStore";
      const getFileDataRes = await getFileData({token, fileId});

      if (getFileDataRes.data.Instruction_for_receiver === this.shareInstruction) {
        let folderId: string | undefined = undefined;
        const getFolderRes = await getFolder({
          token,
        });

        if (getFolderRes.find(folder => folder.name === folderName)) {
          folderId = getFolderRes.find(folder => folder.name === folderName)!.id;
        } else {
          const createFolderRes = await createFolder({
            token,
            folderName,
          });
          folderId = createFolderRes.id;
        }
  
        const createFileRes = await createFile({
          token,
          filename,
          folderId,
        });
  
        const fileIdcopy = createFileRes.id;

        if (fileIdcopy) {
          getFileDataRes.data.Saved = true;
          getFileDataRes.data.Owner = Owner;
          await updateFileData({token, fileId: fileId, body: getFileDataRes.data});
          await updateFileData({token, fileId: fileIdcopy, body: getFileDataRes.data});
        }
        else {
          throw new Error('File not found, not created');
        }
          console.log("FILE COPY CREATED!");
      }
      else if (getFileDataRes.data.Instruction_for_receiver === this.recollectInstruction) {
        const getFilesRes = await getFile({token});
        const getShareFile = getFilesRes.filter((file) => {return file.name.startsWith('share') && !file.name.startsWith('shareRecollect')});
        let data:GetFileDataResponseType={data:{share:"NONE",
                                          accounts:["NONE"],
                                          Instruction_for_receiver:"NONE",
                                          Saved:false,
                                          Owner:"NONE"}};
        for (let i = 0; i<getShareFile.length; i++) {
          data = await getFileData({token, fileId: getShareFile[i].id});
          if (data.data.Owner[0] === Owner[0])
            break;
        }
        if (data.data.share != "NONE") {
          console.log(data.data.share);
          await updateFileData({token, fileId, body:{share:data.data.share}})
        }
        else {
          throw "You don't have the share!";
        }
      }
    }
    catch (error) {
      throw new Error(error as string)
    }
  }
}

export const RecoveryKitSingleton = new RecoveryKit();
