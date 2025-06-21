import React, { useState } from "react";

import type { ChangeEvent, FormEvent } from "react";

interface Prediction {
  no_wildfire_prob: number;
  wildfire_prob: number;
  satellite_image_base64: string;
  heatmap_base64: string;
}

const SliderBlend: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pred, setPred] = useState<Prediction | null>(null);
  // slider: 0 = full heatmap, 100 = full satellite
  const [blend, setBlend] = useState<number>(50);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Choose file");
    const fd = new FormData();
    fd.append("file", file, file.name);
    const res = await fetch("http://127.0.0.1:5000/predict_cam", {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    setPred(json);
  };

  const onSlide = (e: ChangeEvent<HTMLInputElement>) => {
    setBlend(Number(e.target.value));
  };

  return (
    <div className="p-4">
      <form onSubmit={onSubmit} className="mb-4">
        <input type="file" accept="image/*" onChange={onFile} />
        <button type="submit">Go</button>
      </form>

      {pred && (
        <>
          <div className="mb-2">
            No Wildfire: {(pred.no_wildfire_prob * 100).toFixed(1)}% | Wildfire:{" "}
            {(pred.wildfire_prob * 100).toFixed(1)}%
          </div>

          <div
            style={{
              position: "relative",
              width: 524,
              height: 524,
              marginBottom: "1rem",
            }}
          >
            {/* satellite at bottom */}
            <img
              src={`data:image/png;base64,${pred.satellite_image_base64}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: blend / 100,
              }}
              alt="satellite"
            />
            {/* heatmap on top */}
            <img
              src={`data:image/png;base64,${pred.heatmap_base64}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 1 - blend / 100,
              }}
              alt="heatmap"
            />
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={blend}
            onChange={onSlide}
          />
          <div>Heatmap opacity: {(100 - blend).toFixed(0)}%</div>
        </>
      )}
    </div>
  );
};

export default SliderBlend;
