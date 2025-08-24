"use client"

import React, { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useLanguage } from "@/lib/i18n"
import getCroppedImg from "@/lib/getCroppingImg"

interface CropperDialogProps {
  file: File | null
  onCancel: () => void
  onSave: (blob: Blob) => void
}

export function CropperDialog({ file, onCancel, onSave }: CropperDialogProps) {
  const { t } = useLanguage()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!file || !croppedAreaPixels) return
    
    setIsLoading(true)
    try {
      const croppedImage = await getCroppedImg(file, croppedAreaPixels)
      onSave(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  const imageURL = file ? URL.createObjectURL(file) : null

  return (
    <Dialog open={!!file} onOpenChange={onCancel}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("profile.cropAvatar") || "Crop Your Avatar"}</DialogTitle>
        </DialogHeader>
        <div className="relative h-[300px] bg-muted">
          {imageURL && (
            <Cropper
              image={imageURL}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          )}
        </div>
        <div className="mt-4 px-2">
          <div className="mb-2 text-sm text-muted-foreground">
            {t("profile.zoomLevel") || "Zoom Level"}
          </div>
          <Slider 
            min={1} 
            max={3} 
            step={0.1} 
            value={[zoom]} 
            onValueChange={(v) => setZoom(v[0])} 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !croppedAreaPixels}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                {t("common.saving") || "Saving..."}
              </>
            ) : (
              t("common.save") || "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}