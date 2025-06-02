import type { NavigateFunction } from "react-router-dom";
import icons from "../../utility/attachIcon";

interface PopupProps {
  lon: number;
  lat: number;
  navigate: NavigateFunction;
}
interface weatherDataType {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

type Weather = {
  currentConditions: {
    icon: keyof typeof icons;
    temp: number;
    windspeed: number;
    pressure: number;
    conditions: string;
    feelslike: number;
    uvindex: number;
    humidity: number;
    visibility: number;
  };
};

export type { Weather, weatherDataType, PopupProps };
