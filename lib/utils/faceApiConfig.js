let faceApiImportPromise = null;
let faceApiModelsPromise = null;

export const FACE_API_MODEL_PATH = "/models/face-api";

export async function getFaceApi() {
  if (!faceApiImportPromise) {
    faceApiImportPromise = import("face-api.js");
  }

  return faceApiImportPromise;
}

export async function loadFaceApiModels(
  modelPath = FACE_API_MODEL_PATH,
) {
  if (!faceApiModelsPromise) {
    faceApiModelsPromise = (async () => {
      const faceapi = await getFaceApi();

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
      ]);

      return faceapi;
    })().catch((error) => {
      // Clear cache on failure so users can retry after fixing model files.
      faceApiModelsPromise = null;
      throw error;
    });
  }

  return faceApiModelsPromise;
}
