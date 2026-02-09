#!/bin/bash
cd /home/kavia/workspace/code-generation/strategic-grid-battle-317968-317983/strategy_game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

