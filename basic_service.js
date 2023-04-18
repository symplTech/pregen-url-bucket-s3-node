const express = require('express');
require('dotenv').config();

const { S3 } = require("@aws-sdk/client-s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


const s3Client = new S3({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: "https://ams3.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET
    }
});

// Create a function that generates a pre-signed URL for uploading an image to S3
async function generatePresignedUrl() {
    const bucketParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: "jpeg",
        ContentType: "image/jpeg",
        ContentLength: 1048576, // 1MB in bytes
    };
    try {
        const url = await getSignedUrl(s3Client, new PutObjectCommand(bucketParams), { expiresIn: 60 }); // Adjustable expiration.
        console.log("URL:", url);
        return url;
    } catch (err) {
        console.log("Error", err);
    }
}

// Create an Express app
const app = express();

// Define a route that returns a pre-signed URL for a given image
app.get('/presigned-url', async (req, res) => {
    try {
        const url = await generatePresignedUrl();
        res.json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }
});

// Start the server
const port = 3005;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});