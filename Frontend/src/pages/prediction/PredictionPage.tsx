import React, { useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import webIcon from "../../assets/webicon/firecast-icon.png";

interface Prediction {
  noWildFireProb: number;
  yesWildFireProb: number;
  satelliteImage: string;
  heatmapImage: string;
}

const PredictionPage: React.FC = () => {
  const location = useLocation();
  const pred = location.state as Prediction | undefined;
  const [blendRatio, setBlendRatio] = useState<number>(50);
  const navigate = useNavigate();
  const handleBlendChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setBlendRatio(Number(event.target.value));
  };

  if (!pred) {
    return <Navigate to="/" replace />;
  }

  const satelliteImageSrc = pred.satelliteImage
    ? `data:image/png;base64,${pred.satelliteImage}`
    : "";

  const heatmapImageSrc = pred.heatmapImage
    ? `data:image/png;base64,${pred.heatmapImage}`
    : "";

  const formatProbability = (probability: number): string => {
    return `${(probability * 100).toFixed(1)}%`;
  };

  const heatmapOpacity = 100 - blendRatio;

  function home() {
    navigate("/");
  }

  return (
    <div className="bg-neutral-900 ">
      <div className="flex border-transparent">
        <div className="h-10 w-10 border-r-1  border-neutral-700 bg-neutral-800">
          <img src={webIcon} alt="" />
        </div>
        <div className="h-10 flex  justify-between white w-full items-center px-3 bg-neutral-800">
          <div
            className="flex font-semibold items-center cursor-pointer"
            onClick={home}
          >
            <p className=" text-xl font-bold text-neutral-200 ">FireCast</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center p-6 max-w-2xl mx-auto bg-neutral-900 min-h-screen">
        {/* Header Section */}
        <div className="w-full mb-6">
          <h2 className="text-2xl font-semibold text-neutral-100 mb-2">
            Wildfire Risk Analysis
          </h2>

          {/* Probability Statistics */}
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-300 mb-1">
                  No Wildfire Risk
                </span>
                <span className="text-lg font-bold text-green-400">
                  {formatProbability(pred.noWildFireProb)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-300 mb-1">
                  Wildfire Risk
                </span>
                <span className="text-lg font-bold text-red-400">
                  {formatProbability(pred.yesWildFireProb)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Overlay Section */}
        <div className="w-full mb-6">
          <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg border border-neutral-700">
            {satelliteImageSrc && (
              <img
                src={satelliteImageSrc}
                alt="Satellite imagery of analyzed area"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: blendRatio / 100 }}
              />
            )}
            {heatmapImageSrc && (
              <img
                src={heatmapImageSrc}
                alt="Wildfire risk heatmap overlay"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 1 - blendRatio / 100 }}
              />
            )}

            {/* Image Labels */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
              Satellite: {blendRatio}%
            </div>
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
              Heatmap: {heatmapOpacity}%
            </div>
          </div>
        </div>

        {/* Blend Control Section */}
        <div className="w-full">
          <div className="mb-3">
            <label
              htmlFor="blend-slider"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Image Blend Control
            </label>
            <input
              id="blend-slider"
              type="range"
              min={0}
              max={100}
              value={blendRatio}
              onChange={handleBlendChange}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                  100 - blendRatio
                }%, #10b981 ${100 - blendRatio}%, #10b981 100%)`,
              }}
            />
          </div>

          {/* Slider Labels */}
          <div className="flex justify-between text-xs text-neutral-400 px-1">
            <span>Heatmap Only</span>
            <span>Satellite Only</span>
          </div>

          {/* Current Values Display */}
          <div className="mt-3 text-center text-sm text-neutral-300">
            <span className="font-medium">Current Blend:</span> {blendRatio}%
            Satellite, {heatmapOpacity}% Heatmap
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
