Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src  = Join-Path $root '..\img'
$dst  = Join-Path $src 'scenes'
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L

function Resize-ToJpeg($inPath, $outPath, $maxW) {
  $img = [System.Drawing.Image]::FromFile($inPath)
  try {
    $w = [Math]::Min($maxW, $img.Width)
    $h = [int]([double]$img.Height * $w / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $bmp.Save($outPath, $codec, $params)
    $g.Dispose(); $bmp.Dispose()
    Write-Output ("{0} -> {1} ({2}x{3}, {4:N0} KB)" -f (Split-Path $inPath -Leaf), (Split-Path $outPath -Leaf), $w, $h, ((Get-Item $outPath).Length / 1KB))
  } finally { $img.Dispose() }
}

# Video-edit scene screenshots (sorted by filename = scene order)
$shots = Get-ChildItem -Path $src -Filter '*2026-09-21*.png' | Sort-Object Name
$i = 1
foreach ($s in $shots) {
  if ($s.Name -like '*040148*') {
    Resize-ToJpeg $s.FullName (Join-Path $dst 'contents-videoedit.jpg') 960
    continue
  }
  Resize-ToJpeg $s.FullName (Join-Path $dst ('scene-{0:D2}.jpg' -f $i)) 1280
  $i++
}

# Other heavy content thumbnails
$extra = Get-ChildItem -Path $src -Filter '*.png' | Where-Object { $_.Length -gt 300KB -and $_.Name -notlike '*2026-09-21*' }
foreach ($e in $extra) {
  # Japanese file names are matched by size to keep this script ASCII-only
  $name = $null
  if ($e.Name -like 'pro-x-*')   { $name = 'device-mouse.jpg' }
  elseif ($e.Length -eq 1731984) { $name = 'contents-devices.jpg' }  # devices collage
  elseif ($e.Length -eq 307208)  { $name = 'contents-games.jpg' }    # games collage
  if ($name) { Resize-ToJpeg $e.FullName (Join-Path $dst $name) 960 }
}
