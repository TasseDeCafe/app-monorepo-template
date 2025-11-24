#!/bin/bash

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "FFmpeg not found, installing..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg
else
    echo "FFmpeg is already installed"
fi