# FoodLens

<p align="center">
  <img src="./Frontend/src/assets/webicon/text-icon.png" alt="FireCast" width="250" height="250" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)

## Overview

FireCast is a fire prediction and forecasting web app that uses satellite images to show areas likely to burn and provides forecasts to assist with early alerts and planning.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Contact Information](#contact-information)
- [License](#license)

## Live Demo

**Production Environment:**

- Live Demo: https://firecast.up.railway.app

## Features

- **Satellite-Based Fire Prediction**: Use satellite imagery to identify zones at high risk of wildfires.
- **Weather Forecasting**: Provides short and long term weather forecasts to support fire planning and response.
- **Interactive Maps**: Allows users zoom, and select regions to view predictions and historical data.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, D3.js, MapTiler SDK, OpenLayers.
- **Backend (Express)**: Node.js, Express 5, Prisma ORM
- **Backend (Python)**: Flask, TensorFlow, NumPy, Matplotlib, SciPy, OpenCV, h5py, Gunicorn, Waitress
- **Database**: PostgreSQL (via Prisma Client)
- **Deployment & Hosting**: Railway

## Getting Started

### Prerequisites

- Node.js ≥ 16.0.0
- Python ≥ 3.8
- PostgreSQL
- Visual Crossing API key
- Open Weather API key

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:Etativel/FireCast.git
   cd FireCast

   ```

2. **Setup Express Backend**

   ```bash
        cd backend/express
        npm install
        cp .env.example .env
        # Edit .env and add the following keys:
        # VISUAL_CROSSING_API
        # OPEN_WEATHER_API

        npx prisma migrate dev --name init
        node index.js

   ```

3. **Setup Python Backend**

   ```bash
        cd ../../backend/python
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        # Run with Gunicorn (production):
        gunicorn app:app --workers 4 --bind 0.0.0.0:5000
        # Or with Waitress (Windows):
        waitress-serve --call "app:create_app"

   ```

4. **Setup Frontend**
   ```bash
        cd ../../frontend
        npm install
        npm run dev
   ```

### Environment Variables

**Express Backend (backend/express/.env):**

- `VISUAL_CROSSING_API`= API key for Visual Crossing weather service
- `OPEN_WEATHER_API`= API key for OpenWeather
- `MAPTILER_API` = API key for map

## Contributing

Feel free to submit a Pull Request.

1. Fork the repository
2. Create a branch: git checkout -b feature/my-feature
3. Commit your changes: git commit -m 'Add some feature'
4. Push to your branch: git push origin feature/my-feature
5. Open a Pull Request

### Contact Information

- Maintainer: Farhan
- Email: farhanmaulana.dev@gmail.com
- GitHub: https://github.com/Etativel

## License

[MIT](https://github.com/Etativel/FireCast/blob/main/LICENSE)
