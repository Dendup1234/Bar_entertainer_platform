import crypto from "crypto";
import path from "path";
import { generateUploadSasUrl } from "../utils/generateBlobSas.js";
import { containerName } from "../config/azureBlob.js";

export const getUploadSas = async (req, res) => {
  try {
    const { fileName, mimeType } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({
        message: "fileName and mimeType are required",
      });
    }

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!accountName || !accountKey) {
      return res.status(500).json({
        message: "Azure storage credentials are not configured",
      });
    }

    const extension = path.extname(fileName);
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const { sasUrl, expiresOn } = generateUploadSasUrl({
      accountName,
      accountKey,
      containerName,
      blobName: uniqueName,
      contentType: mimeType,
      expiresInMinutes: 15,
    });

    return res.status(200).json({
      message: "SAS URL generated successfully",
      blobName: uniqueName,
      sasUrl,
      expiresOn,
      fileUrl: `https://${accountName}.blob.core.windows.net/${containerName}/${uniqueName}`,
    });
  } catch (error) {
    console.error("getUploadSas error:", error);
    return res.status(500).json({
      message: "Failed to generate SAS URL",
    });
  }
};
