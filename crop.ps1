Add-Type -AssemblyName System.Drawing

$src1 = "C:\Users\Cyber Fox\FRizz Projek\Mobile App\Karajo - Your AI-Powered HR System\2. Onboarding - 1.png"
$src2 = "C:\Users\Cyber Fox\FRizz Projek\Mobile App\Karajo - Your AI-Powered HR System\3. Onboarding - 2.png"
$src3 = "C:\Users\Cyber Fox\FRizz Projek\Mobile App\Karajo - Your AI-Powered HR System\4. Onboarding - 3.png"

$dest1 = "c:\Users\Cyber Fox\FRizz Projek\Mobile App\karajo-hr\src\assets\images\onboarding-1.png"
$dest2 = "c:\Users\Cyber Fox\FRizz Projek\Mobile App\karajo-hr\src\assets\images\onboarding-2.png"
$dest3 = "c:\Users\Cyber Fox\FRizz Projek\Mobile App\karajo-hr\src\assets\images\onboarding-3.png"

function Crop-Image {
    param([string]$src, [string]$dest, [int]$x, [int]$y, [int]$w, [int]$h)
    
    $bmp = [System.Drawing.Image]::FromFile($src)
    $cropRect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $croppedBmp = New-Object System.Drawing.Bitmap($w, $h)
    
    $gfx = [System.Drawing.Graphics]::FromImage($croppedBmp)
    $gfx.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $croppedBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $gfx.Dispose()
    $croppedBmp.Dispose()
    $bmp.Dispose()
}

Crop-Image -src $src1 -dest $dest1 -x 0 -y 0 -w 390 -h 460
Crop-Image -src $src2 -dest $dest2 -x 0 -y 100 -w 390 -h 380
Crop-Image -src $src3 -dest $dest3 -x 22 -y 122 -w 390 -h 410

Write-Output "Cropping completed successfully."
