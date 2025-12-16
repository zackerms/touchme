import type { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Read the request body as a buffer
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);

        const blob = await put(filename, buffer, {
          access: "public",
          addRandomSuffix: true,
        });

        return res.status(200).json(blob);
      } catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({ error: "Failed to upload file" });
      }
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      return res.status(500).json({ error: "Request error" });
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
