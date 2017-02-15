#!/bin/bash
echo "Num Args = $#"
echo "Args = $1"
if [ "$1" == "test" ]; then
echo "Running mocha tests in /app/test/"
	cd /app/
	/app/node_modules/mocha/bin/mocha
else
echo "Running nodejs"
	node /app/src/main.js
fi
