"use client"

import { useState, useRef } from "react"
import { Mic, Square, AudioWaveformIcon as Waveform } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceTranscription {
  text: string
  confidence: number
}

interface VoiceRecorderProps {
  onTranscription: (transcription: VoiceTranscription) => void
  disabled?: boolean
}

export function VoiceRecorder({ onTranscription, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" })

        // Simulate transcription processing
        setTimeout(() => {
          const mockTranscription: VoiceTranscription = {
            text: "This is a sample transcription. In a real implementation, this would be the actual transcribed text from your voice recording.",
            confidence: 0.85,
          }
          onTranscription(mockTranscription)
          setIsProcessing(false)
        }, 2000)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled || isProcessing}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-amber-600 hover:from-green-600 hover:to-amber-700 text-white rounded-full w-20 h-20 shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 text-white rounded-full w-20 h-20 shadow-xl animate-pulse"
            >
              <Square className="h-8 w-8" />
            </Button>
          )}
          {isRecording && <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />}
        </div>
        <div className="text-center space-y-2">
          {isProcessing && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          )}
          {isProcessing && <p className="text-green-100 font-medium">Processing your recording...</p>}
          {isRecording && (
            <p className="text-white font-semibold flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Recording... Click to stop
            </p>
          )}
          {!isRecording && !isProcessing && (
            <p className="text-green-100">Click the microphone to start recording your event details</p>
          )}
        </div>
        {isRecording && (
          <div className="flex items-end justify-center space-x-1 h-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-green-400 to-amber-200 rounded-full animate-pulse"
                style={{
                  width: "4px",
                  height: `${Math.random() * 32 + 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        )}
        {!isRecording && !isProcessing && (
          <div className="text-center space-y-2 max-w-sm">
            <div className="flex items-center justify-center gap-2 text-green-200 text-sm">
              <Waveform className="h-4 w-4" />
              <span className="font-medium">Pro Tip</span>
            </div>
            <p className="text-green-100 text-sm leading-relaxed">
              Speak naturally about your event - mention the title, date, location, and any special details you'd like
              to include.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
