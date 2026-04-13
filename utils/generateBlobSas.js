import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export function generateUploadSasUrl({
  accountName,
  accountKey,
  containerName,
  blobName,
  contentType,
  expiresInMinutes = 15,
}) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey,
  );

  const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      startsOn: new Date(),
      expiresOn,
      contentType,
    },
    sharedKeyCredential,
  ).toString();

  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

  return { sasUrl, expiresOn };
}