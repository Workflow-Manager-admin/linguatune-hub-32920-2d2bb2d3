#!/bin/bash
cd /home/kavia/workspace/code-generation/linguatune-hub-32920-2d2bb2d3/linguatune_hub
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

