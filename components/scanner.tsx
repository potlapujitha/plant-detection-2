"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Camera, MapPin, History, Upload, Zap } from "lucide-react"
import Link from "next/link"
import { getAllDetectableItems } from "@/lib/plant-database"

interface DetectionResult {
  isPlant: boolean
  plantName?: string
  confidence: number
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  timestamp: string
}

export default function ScannerComponent() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [error, setError] = useState("")
  const [scanMode, setScanMode] = useState<"camera" | "upload" | "example">("camera")
  const [allItems] = useState(getAllDetectableItems())

  // Initialize camera
  useEffect(() => {
    if (scanMode !== "camera") return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError("Unable to access camera. Please check permissions.")
        console.error(err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [scanMode])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (err) => {
          console.error("Geolocation error:", err)
        },
      )
    }
  }, [])

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsLoading(true)
    setError("")

    try {
      const context = canvasRef.current.getContext("2d")
      if (!context) return

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)

      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return
        await sendDetectionRequest(blob)
      })
    } catch (err) {
      setError("Error capturing image")
      console.error(err)
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError("")

    try {
      await sendDetectionRequest(file)
    } catch (err) {
      setError("Error processing image")
      console.error(err)
      setIsLoading(false)
    }
  }

  const handleExampleScan = async (itemId: string) => {
    setIsLoading(true)
    setError("")

    try {
      const item = allItems.find((i) => i.id === itemId)
      if (!item) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = async () => {
        if (!canvasRef.current) return
        const context = canvasRef.current.getContext("2d")
        if (!context) return

        canvasRef.current.width = img.width
        canvasRef.current.height = img.height
        context.drawImage(img, 0, 0)

        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return
          await sendDetectionRequest(blob)
        })
      }
      img.onerror = () => {
        setError("Failed to load example image")
        setIsLoading(false)
      }
      img.src = item.image
    } catch (err) {
      setError("Error scanning example")
      console.error(err)
      setIsLoading(false)
    }
  }

  const sendDetectionRequest = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("image", blob)
      if (location) {
        formData.append("latitude", location.latitude.toString())
        formData.append("longitude", location.longitude.toString())
      }

      const response = await fetch("/api/detect-plant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || "Detection failed")
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setResult(data)
      setIsScanning(false)
      setScanMode("camera")
    } catch (err) {
      setError("Error processing image")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Plant Scanner</h2>
        <Link
          href="/examples"
          className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          View All Examples
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mode Selector */}
            <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setScanMode("camera")
                  setResult(null)
                  setError("")
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  scanMode === "camera"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>
              <button
                onClick={() => {
                  setScanMode("upload")
                  setResult(null)
                  setError("")
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  scanMode === "upload"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={() => {
                  setScanMode("example")
                  setResult(null)
                  setError("")
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  scanMode === "example"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Zap className="w-4 h-4" />
                Examples
              </button>
            </div>

            {/* Camera Mode */}
            {scanMode === "camera" && (
              <div>
                {isScanning ? (
                  <div className="relative w-full bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Camera will start when you begin scanning</p>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                  )}

                  <button
                    onClick={() => {
                      setIsScanning(!isScanning)
                      setResult(null)
                    }}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    {isScanning ? "Stop Camera" : "Start Camera"}
                  </button>

                  {isScanning && (
                    <button
                      onClick={captureAndDetect}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      {isLoading ? "Analyzing..." : "Capture & Detect"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upload Mode */}
            {scanMode === "upload" && (
              <div className="p-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-2">Click to upload an image</p>
                  <p className="text-gray-500 text-sm">or drag and drop</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {isLoading && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 mt-2">Analyzing image...</p>
                  </div>
                )}
              </div>
            )}

            {/* Example Mode */}
            {scanMode === "example" && (
              <div className="p-6">
                <p className="text-gray-700 font-semibold mb-4">Click on any example to scan it:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {allItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleExampleScan(item.id)}
                      disabled={isLoading}
                      className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <span className="text-white font-semibold text-sm text-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {isLoading && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 mt-2">Analyzing image...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detection Result</h2>

            {result ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${result.isPlant ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                >
                  <p className={`font-semibold ${result.isPlant ? "text-green-900" : "text-red-900"}`}>
                    {result.isPlant ? "✓ Plant Detected" : "✗ Not a Plant"}
                  </p>
                  {result.plantName && (
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Species:</strong> {result.plantName}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                {result.location && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-900 text-sm">Location</p>
                        <p className="text-xs text-gray-700 mt-1">
                          Lat: {result.location.latitude.toFixed(4)}
                          <br />
                          Lon: {result.location.longitude.toFixed(4)}
                        </p>
                        {result.location.address && (
                          <p className="text-xs text-gray-700 mt-1">{result.location.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</p>

                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Clear Result
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Scan a plant to see detection results</p>
              </div>
            )}

            <Link
              href="/history"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <History className="w-5 h-5" />
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
