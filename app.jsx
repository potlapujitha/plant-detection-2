import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export default function App() {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [info, setInfo] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 🌿 Extended plant info database
  const plantData = {
    rose: {
      location: "Famous in India, France, and England",
      use: "Used in perfumes, decorations, and skincare products.",
    },
    tulip: {
      location: "Famous in the Netherlands",
      use: "Popular for gardens and floral gifts.",
    },
    sunflower: {
      location: "Famous in the USA and India",
      use: "Source of sunflower oil and ornamental flower.",
    },
    lotus: {
      location: "National flower of India, found across Asia",
      use: "Used in worship, medicine, and as a food ingredient.",
    },
    hibiscus: {
      location: "Common in tropical regions worldwide",
      use: "Used in hair oils, teas, and skincare.",
    },
    lavender: {
      location: "Famous in France (Provence region)",
      use: "Used in aromatherapy, perfumes, and relaxation oils.",
    },
    snake: {
      location: "Popular indoor plant worldwide",
      use: "Purifies air and easy to maintain indoors.",
    },
  };

  // 🧠 Load the TensorFlow MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      console.log("✅ Model loaded successfully");
    };
    loadModel();
  }, []);

  // 📸 Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const imgURL = URL.createObjectURL(file);
    setImage(imgURL);
    setResult("");
    setInfo({});
  };

  // 🔍 Predict if the image is a plant
  const predictPlant = async () => {
    if (!model || !image) {
      alert("Please upload an image first!");
      return;
    }

    const imgElement = document.getElementById("uploadedImage");
    const predictions = await model.classify(imgElement);
    const label = predictions[0].className.toLowerCase();
    console.log("Prediction:", label);

    // Broad plant-related keywords
    const plantKeywords = ["plant", "flower", "leaf", "tree", "potted", "grass"];
    const isPlant = plantKeywords.some((word) => label.includes(word));

    if (isPlant) {
      const plantName = Object.keys(plantData).find((p) =>
        label.includes(p)
      );

      if (plantName) {
        setResult(
          `🌿 This is a ${
            plantName.charAt(0).toUpperCase() + plantName.slice(1)
          }!`
        );
        setInfo({
          famousFor: plantData[plantName].location,
          use: plantData[plantName].use,
        });
      } else {
        setResult("🌿 This is a plant!");
        setInfo({
          famousFor: "Common in homes and gardens worldwide",
          use: "Used for oxygen and beautification purposes.",
        });
      }
    } else {
      setResult("❌ This is not a plant!");
    }
  };

  // 🔐 Handle Login (accepts any input)
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true); // ✅ Accept all users automatically
  };

  // 🪴 Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-center p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          🌱 Welcome to Plant Detection App
        </h1>
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow-lg w-80"
        >
          <input
            type="text"
            placeholder="Enter any username"
            className="border w-full p-2 mb-3 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter any password"
            className="border w-full p-2 mb-4 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition"
          >
            Login
          </button>
          <p className="text-gray-600 text-sm mt-2">
            (You can enter anything to continue)
          </p>
        </form>
      </div>
    );
  }

  // 🌿 Main Detection Page
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        🌿 Plant Detection App
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />

      {image && (
        <img
          id="uploadedImage"
          src={image}
          alt="Uploaded preview"
          width="250"
          className="rounded-xl shadow-md mb-4"
        />
      )}

      <button
        onClick={predictPlant}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Detect Plant
      </button>

      {result && (
        <div className="mt-4 text-lg font-semibold text-green-700">
          {result}
          {info.famousFor && (
            <>
              <p className="text-sm text-gray-700 mt-2">🌍 {info.famousFor}</p>
              <p className="text-sm text-gray-700 mt-1">🪴 {info.use}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
