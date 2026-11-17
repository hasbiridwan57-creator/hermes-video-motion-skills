#!/bin/bash
set -e
cd "$(dirname "$0")"
N=$(ls frames/*.png | wc -l | tr -d ' ')
echo "frames: $N"
# ambil durasi audio
ADUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/full_mix.mp3)
echo "audio dur: $ADUR s"
# encode H.264 yuv420p, 30fps, audio AAC, faststart
ffmpeg -y -v error \
  -framerate 30 -i frames/f%05d.png \
  -i public/full_mix.mp3 \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -shortest \
  -movflags +faststart \
  public/function_calling.mp4
echo "=== hasil ==="
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames,duration -of default=noprint_wrappers=1 public/function_calling.mp4
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=noprint_wrappers=1 public/function_calling.mp4
ls -la public/function_calling.mp4
