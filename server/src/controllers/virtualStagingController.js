const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Buffer } = require('buffer');

// 1. Helper to fetch and convert images (URLs or base64)
async function getBase64(imageData) {
    if (!imageData) return null;
    if (imageData.startsWith('data:')) {
        return imageData.split(',')[1];
    } else if (imageData.startsWith('http')) {
        const response = await axios.get(imageData, {
            responseType: 'arraybuffer',
            timeout: 35000
        });
        return Buffer.from(response.data).toString('base64');
    } else {
        return imageData.replace(/\s/g, '');
    }
}

const virtualStage = async (req, res) => {
    try {
        const { roomImage, furnitureImage, furnitureName } = req.body;
        if (!roomImage || !furnitureImage) {
            return res.status(400).json({ message: 'Room and Furniture images are required' });
        }

        const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'visara-480709';
        // CHANGE: Setting to 'global' to match 2026 Gemini 3 documentation
        const location = 'us-central1';

        console.log(`Using Vertex AI [Project: ${projectId}, Location: ${location}]`);

        // 2. Initialize Client
        const vertexAI = new VertexAI({ project: projectId, location: location });

        // 3. Get the specific Nano Banana Pro model
        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-2.5-flash-image',
        });

        const prompt = `Virtual Staging: Take the ${furnitureName || 'furniture'} from the second image and place it naturally in the room from the first image. Ensure lighting and shadows are photorealistic.`;

        const roomBase64 = await getBase64(roomImage);
        const furnitureBase64 = await getBase64(furnitureImage);

        console.log("Calling Gemini 3 Pro with IMAGE modality...");

        // 4. Request with 2026 Documentation Specs
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: roomBase64 } },
                    { inlineData: { mimeType: 'image/jpeg', data: furnitureBase64 } }
                ]
            }],
            generationConfig: {
                // This activates the Nano Banana image-generation engine
                responseModalities: ['IMAGE', 'TEXT'],
                temperature: 0.7,
                candidateCount: 1,
            }
        });

        const response = await result.response;

        // Safety check for empty or blocked responses
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("Empty response from AI. Possible safety filter block.");
        }

        const parts = response.candidates[0].content.parts;
        let generatedImageUrl = null;
        let analysisText = '';

        // 5. Output Processing
        for (const part of parts) {
            if (part.inlineData) {
                const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                const fileName = `staged_${Date.now()}.jpg`;
                const outputDir = path.join(__dirname, '../../public/generated');

                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                const filePath = path.join(outputDir, fileName);
                fs.writeFileSync(filePath, imageBuffer);

                const protocol = req.protocol;
                const host = req.get('host');
                generatedImageUrl = `${protocol}://${host}/generated/${fileName}`;
            } else if (part.text) {
                analysisText += part.text;
            }
        }

        if (!generatedImageUrl) {
            return res.status(200).json({
                success: false,
                message: "No image generated. Feedback: " + analysisText
            });
        }

        console.log("Staging Success:", generatedImageUrl);
        return res.status(200).json({
            success: true,
            imageUrl: generatedImageUrl,
            analysis: analysisText
        });

    } catch (error) {
        console.error('Critical AI Error:', error);

        // Final fallback for the "404" or "Token" errors
        const errorMessage = error.message.includes('404')
            ? "Model not found. Please ensure you have accepted the Gemini 3 terms in the Google Cloud Console Model Garden."
            : error.message;

        res.status(500).json({ message: 'Staging failed', error: errorMessage });
    }
};

module.exports = { virtualStage };