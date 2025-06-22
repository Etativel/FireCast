from flask import Flask, request, jsonify, send_from_directory
from tensorflow.keras.models import Model, load_model
from flask_cors import CORS
import io, base64
import numpy as np
import cv2, scipy as sp

app = Flask(__name__, static_folder="static")
CORS(app)

# Load & wrap the CAM model
base_model = load_model('../model/CAM_model_10epoch.h5')
cam_model = Model(
    inputs=base_model.input,
    outputs=[
        base_model.layers[-3].output,
        base_model.layers[-1].output
    ]
)
# input size
IM_SIZE = 224  

def compute_cam(feats: np.ndarray, gap_w: np.ndarray) -> np.ndarray:
  
    fmap = feats[0]
  
    up = sp.ndimage.zoom(
        fmap,
        (IM_SIZE/fmap.shape[0], IM_SIZE/fmap.shape[1], 1),
        order=2
    )
    cam = np.dot(up, gap_w[:,1])
    cam = (cam - cam.min())/(cam.max() - cam.min())
    return cam

def encode_png_b64(image: np.ndarray, with_alpha: bool=False) -> str:
    """
    Encode `image` (H×W×3 BGR or H×W×4 BGRA) as PNG, return Base64 string.
    """
    ext = '.png'
    success, buf = cv2.imencode(ext, image)
    if not success:
        raise RuntimeError("PNG encoding failed")
    return base64.b64encode(buf.tobytes()).decode('utf-8')

@app.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory(app.static_folder, 'favicon.ico')
    except Exception as e:
        logger.error(f"Favicon error: {e}")
        return '', 204

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to the FireCast Image-Prediction API",
        "endpoints": {
            "POST /predict": "Upload an image file under form-field `file`"
        }
    })


@app.route('/predict_cam', methods=['POST'])
def predict_cam():
    if 'file' not in request.files:
        return jsonify(error="no file"), 400

    data = request.files['file'].read()
    npimg = np.frombuffer(data, np.uint8)
    orig_bgr = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if orig_bgr is None:
        return jsonify(error="invalid image"), 400

    # prepare model input
    rgb = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (IM_SIZE, IM_SIZE)) / 255.0
    inp = np.expand_dims(resized, 0)

    # predict
    feats, preds = cam_model.predict(inp)
    gap_w = cam_model.layers[-1].get_weights()[0]
    cam = compute_cam(feats, gap_w)     
    probs = preds[0]                    

    h0, w0 = orig_bgr.shape[:2]
    cam_up = cv2.resize(cam, (w0, h0), interpolation=cv2.INTER_LINEAR)


    heatmap_8u = (cam_up * 255).astype(np.uint8)
    heat_bgr = cv2.applyColorMap(heatmap_8u, cv2.COLORMAP_JET)


    alpha = (cam_up * 255).astype(np.uint8)
    heat_bgra = cv2.cvtColor(heat_bgr, cv2.COLOR_BGR2BGRA)
    heat_bgra[...,3] = alpha

    # encode both full‑res originals
    sat_b64  = encode_png_b64(orig_bgr)     
    heat_b64 = encode_png_b64(heat_bgra)    

    return jsonify({
        "no_wildfire_prob": float(probs[0]),
        "wildfire_prob":    float(probs[1]),
        "satellite_image_base64": sat_b64,
        "heatmap_base64":         heat_b64
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
