import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
  });
}

export function ImageCropper({ open, onClose, imageSrc, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;
    const blob = await getCroppedImg(imgRef.current, completedCrop);
    onCropComplete(blob);
    onClose();
  }, [completedCrop, onCropComplete, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Profile Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img ref={imgRef} src={imageSrc} alt="Crop" className="max-h-[400px]" />
          </ReactCrop>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save Photo</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
