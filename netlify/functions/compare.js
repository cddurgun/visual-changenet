const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const NVAI_URL = "https://ai.api.nvidia.com/v1/cv/nvidia/visual-changenet";
const HEADER_AUTH = `Bearer ${process.env.NVIDIA_API_KEY || "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"}`;

async function uploadAsset(imageBuffer, description) {
  // Authorize upload
  const authorizeResponse = await fetch("https://api.nvcf.nvidia.com/v2/nvcf/assets", {
    method: 'POST',
    headers: {
      "Authorization": HEADER_AUTH,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      contentType: "image/jpeg",
      description: description
    })
  });

  if (!authorizeResponse.ok) {
    throw new Error(`Authorization failed: ${await authorizeResponse.text()}`);
  }

  const authData = await authorizeResponse.json();

  // Upload the image
  const uploadResponse = await fetch(authData.uploadUrl, {
    method: 'PUT',
    headers: {
      "x-amz-meta-nvcf-asset-description": description,
      "content-type": "image/jpeg",
    },
    body: imageBuffer
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${await uploadResponse.text()}`);
  }

  return authData.assetId;
}

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.reference || !data.test) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Both reference and test images are required' })
      };
    }

    // Decode base64 images
    const referenceBuffer = Buffer.from(
      data.reference.includes(',') ? data.reference.split(',')[1] : data.reference,
      'base64'
    );
    const testBuffer = Buffer.from(
      data.test.includes(',') ? data.test.split(',')[1] : data.test,
      'base64'
    );

    console.log('Uploading reference image...');
    const assetId1 = await uploadAsset(referenceBuffer, "Reference Image");

    console.log('Uploading test image...');
    const assetId2 = await uploadAsset(testBuffer, "Test Image");

    // Prepare API request
    const inputs = {
      reference_image: assetId1,
      test_image: assetId2
    };
    const assetList = `${assetId1}, ${assetId2}`;

    console.log('Requesting change detection...');
    const compareResponse = await fetch(NVAI_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "NVCF-INPUT-ASSET-REFERENCES": assetList,
        "NVCF-FUNCTION-ASSET-IDS": assetList,
        "Authorization": HEADER_AUTH,
      },
      body: JSON.stringify(inputs)
    });

    if (!compareResponse.ok) {
      throw new Error(`API request failed: ${await compareResponse.text()}`);
    }

    // Get the zip file
    const zipBuffer = await compareResponse.buffer();

    // Parse zip to extract result image and inference time
    const JSZip = require('jszip');
    const zip = await JSZip.loadAsync(zipBuffer);

    let resultImage = null;
    let inferenceTime = null;

    for (const filename of Object.keys(zip.files)) {
      if (filename.endsWith('.jpg')) {
        const imageData = await zip.files[filename].async('base64');
        resultImage = `data:image/jpeg;base64,${imageData}`;
      } else if (filename.endsWith('.response')) {
        const responseData = await zip.files[filename].async('string');
        const responseJson = JSON.parse(responseData);
        inferenceTime = responseJson.inference_time;
      }
    }

    if (!resultImage) {
      throw new Error('No result image found in response');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        result_image: resultImage,
        inference_time: inferenceTime
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
