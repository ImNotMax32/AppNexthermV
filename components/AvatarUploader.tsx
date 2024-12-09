import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import Cropper from 'react-easy-crop';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface Point { x: number; y: number }
interface Area { x: number; y: number; width: number; height: number }

const ImageCropper = ({
  image,
  onCropComplete,
  onClose
}: {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = 400;
    canvas.height = 400;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      400,
      400
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Canvas is empty');
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCrop = async () => {
    if (croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        onCropComplete(croppedImage);
      } catch (error) {
        toast.error('Erreur lors du recadrage de l\'image');
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Ajuster votre photo de profil</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ height: '400px' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>
        <div className="p-6 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Zoom:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button className="bg-[#86BC29] hover:bg-[#75a625]" onClick={handleCrop}>
              Appliquer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AvatarUploaderProps {
  currentImageUrl?: string;
  userInitials: string;
  onImageChange: (imageUrl: string) => void;
}

export const AvatarUploader = ({ currentImageUrl = '', userInitials, onImageChange }: AvatarUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const extractFilePathFromUrl = (url: string) => {
    const storageUrl = supabase.storage.from('avatars').getPublicUrl('').data.publicUrl;
    return url.replace(storageUrl, '');
  };

  const handleRemoveImage = async () => {
    if (!previewUrl) return;

    try {
      setIsUploading(true);
      const filePath = extractFilePathFromUrl(previewUrl);
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) throw error;

      setPreviewUrl('');
      onImageChange('');
      toast.success('Photo de profil supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    setShowCropper(false);

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`profile-${Date.now()}.jpg`, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      setPreviewUrl(publicUrl);
      onImageChange(publicUrl);
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(tempImageUrl);
    }
  };


  return (
    <div className="flex items-center space-x-4">
      <div className="h-16 w-16 rounded-full bg-[#86BC29] flex items-center justify-center text-white text-xl">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
        ) : userInitials}
      </div>
      <div className="flex flex-col space-y-2">
        <div className="space-y-1">
          <Label>Photo de profil</Label>
          <div className="text-sm text-gray-500">
            JPG, PNG ou GIF. 5MB maximum.
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
            size="sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Téléchargement...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Changer la photo
              </>
            )}
          </Button>

          {previewUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={handleRemoveImage}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {showCropper && tempImageUrl && (
        <ImageCropper
          image={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropper(false);
            URL.revokeObjectURL(tempImageUrl);
          }}
        />
      )}
    </div>
  );
};