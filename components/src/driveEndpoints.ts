import axios from "axios";
import {
  CreateFolderType,
  CreateFolderResponseType,
  GetFileAndFolderType,
  GetFileAndFolderResponseType,
  GetFolderType,
  GetFolderResponseType,
  GetFileResponseType,
  CreateFileType,
  CreateFileResponseType,
  UpdateFileDataType,
  UpdateFileDataResponseType,
  GetFileDataType,
  GetFileDataResponseType,
  TokenType,
  shareFileType,
  shareFileResponseType,
} from "./types";

export const createFolder = async (
  params: CreateFolderType
): Promise<CreateFolderResponseType> => {
  return await axios({
    method: "post",
    url: `https://www.googleapis.com/drive/v2/files`,
    headers: {
      Authorization: "Bearer " + params.token,
    },
    data: {
      title: params.folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
  })
    .then((data) => {
      return { id: data.data.id, name: params.folderName };
    })
    .catch((error) => {
      throw new Error("Error: Create Folder Endpoint");
    });
};

export const getFilesAndFolder = async (
  params: GetFileAndFolderType
): Promise<GetFileAndFolderResponseType> => {
  return await axios
    .request({
      method: "get",
      url: `https://www.googleapis.com/drive/v2/files`,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + params.token,
      },
    })
    .then((data) => {
      return data.data.items.map((file: any) => ({
        id: file.id,
        name: file.title,
        type:
          file.mimeType === "application/vnd.google-apps.folder"
            ? "folder"
            : "file",
        isTrashed: file.explicitlyTrashed,
      }));
    })
    .catch((error) => {
      throw new Error("Error: Get File And Folder Endpoint");
    });
};

export const getFilesAndFolderShared = async (
  params: GetFileAndFolderType
): Promise<GetFileAndFolderResponseType> => {
  return await axios
    .request({
      method: "get",
      url: `https://www.googleapis.com/drive/v2/files?sharedWithMe=true`,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + params.token,
      },
    })
    .then((data) => {
      return data.data.items.map((file: any) => ({
        id: file.id,
        name: file.title,
        type:
          file.mimeType === "application/vnd.google-apps.folder"
            ? "folder"
            : "file",
        isTrashed: file.explicitlyTrashed,
        shared: file.shared,
        Owner: file.ownerNames,
      }))
    })
    .catch((error) => {
      throw new Error("Error: Get File And Folder Endpoint");
      // return { error: error };
    });
};

export const getFolder = async (
  params: GetFolderType
): Promise<GetFolderResponseType> => {
  return await getFilesAndFolder(params)
    .then((data) =>
      data.filter((f) => f.isTrashed === false && f.type === "folder")
    )
    .catch((error) => {
      throw new Error(error);
    });
};

export const getFile = async (
  params: GetFileAndFolderType
): Promise<GetFileResponseType> => {
  return await getFilesAndFolder(params)
    .then((data) =>
      data.filter((f) => f.isTrashed === false && f.type === "file")
    )
    .catch((error) => {
      throw new Error(error);
    });
};

export const createFile = async (
  params: CreateFileType
): Promise<CreateFileResponseType> => {
  return await axios({
    method: "post",
    url: `https://www.googleapis.com/drive/v3/files`,
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + params.token,
    },
    data: {
      name: params.filename,
      ...(params.folderId ? { parents: [params.folderId] } : {}),
      mimeType: "text/plain",
    },
  })
    .then((data) => {
      return { id: data.data.id, name: params.filename };
    })
    .catch((error) => {
      throw new Error("Error: Create File Endpoint");
    });
};

export const shareFile = async (
  params: shareFileType
): Promise<shareFileResponseType> => {
  return await axios({
    method: "POST",
    url:`https://www.googleapis.com/drive/v3/files/${params.fileId}/permissions?supportsAllDrives=true`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + params.token,
    },
    data: JSON.stringify({
      type: 'user',
      role: 'writer',
      emailAddress: params.emailaddr,
    })
  })
    .then((data) => ({
      id: data.data.id,
    }))
    .catch((error) => {
      throw new Error("Error: Share file endpoint " + error)
    })
  ;

}

export const updateFileData = async (
  params: UpdateFileDataType
): Promise<UpdateFileDataResponseType> => {
  return await axios({
    method: "put",
    url: `https://www.googleapis.com/upload/drive/v2/files/${params.fileId}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + params.token,
    },
    data: params.body,
  })
    .then((data) => ({
      id: data.data.id,
      name: data.data.title,
    }))
    .catch((error) => {
      throw new Error("Error: Update File Endpoint");
    });
};

export const getUserIdFromAccessToken = async (params: TokenType) => {
  return await axios({
    method: "get",
    url: `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${params.token}`,
  })
    .then((data) => {
      return data["data"]["email"];
    })
    .catch((error) => {
      throw new Error("Error: Get User Id from endpoint Endpoint");
    });
};

export const getFileData = async (
  params: GetFileDataType
): Promise<GetFileDataResponseType> => {
  return await axios({
    method: "get",
    url: `https://www.googleapis.com/drive/v2/files/${params.fileId}?alt=media`,
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + params.token,
    },
  })
    .then((data) => {
      return { data: data.data };
    })
    .catch((error) => {
      throw new Error("Error: Get File Endpoint");
    });
};
