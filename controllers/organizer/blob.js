import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();
import Bar from "../../models/bar.js";
import Event from "../../models/event.js";

import {
  StorageSharedKeyCredential,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey,
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential,
);

const containerClient = blobServiceClient.getContainerClient(containerName);

const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_SIZE = 50 * 1024 * 1024;

export const generateSAS = async (req, res) => {
  try {
    const { mimeType, size } = req.body;

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    if (size > MAX_SIZE) {
      return res.status(400).json({ error: "File too large" });
    }

    const ext = mimeType.split("/")[1] || "bin";
    const blobName = `${uuidv4()}.${ext}`;

    const startsOn = new Date(Date.now() - 5 * 60 * 1000);
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("cw"),
        startsOn,
        expiresOn,
        contentType: mimeType,
      },
      sharedKeyCredential,
    ).toString();

    const blobClient = containerClient.getBlockBlobClient(blobName);

    res.json({
      sasUrl: `${blobClient.url}?${sasToken}`,
      blobName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SAS generation failed" });
  }
};

export const confirmUpload = async (req, res) => {
  try {
    const { blobName, barId, eventId, imageType } = req.body;
    const userId = req.user.sub;

    if (!blobName) {
      return res
        .status(400)
        .json({ error: "Missing blobName or originalName" });
    }

    const blobClient = containerClient.getBlobClient(blobName);

    if (!(await blobClient.exists())) {
      return res.status(400).json({ error: "Upload not found" });
    }

    if (imageType == "event") {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { bannerImageUrl: blobClient.url },
        { new: true },
      );

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      return res.status(200).json({
        message: "Event image upload confirmed",
        data: event,
      });
    }

    if (imageType == "bar") {
      const bar = await Bar.findByIdAndUpdate(
        barId,
        { profileImage: blobClient.url },
        { new: true },
      );
      if (!bar) {
        return res.status(404).json({ error: "Bar not found" });
      }

      return res.status(200).json({
        message: "Bar image upload confirmed",
        data: bar,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Confirmation failed" });
  }
};
