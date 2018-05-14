#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
  ganache_port=8555
else
  ganache_port=8545
fi

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  # We define 10 accounts with balance 1M ether, needed for high-value tests.
  local accounts=(
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a00,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a01,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a02,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a03,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a04,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a05,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a06,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a07,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a08,1000000000000000000000000"
  --account="0x75a5ba3fd7c0619b4db68c6fa518f9a41ac8196906ec274b1080d6ee3a2e1a09,1000000000000000000000000"
  )

  if [ "$SOLIDITY_COVERAGE" = true ]; then
    node_modules/.bin/testrpc-sc --gasLimit 0xfffffffffff --port "$ganache_port" "${accounts[@]}" > /dev/null &
  else
    node_modules/.bin/ganache-cli --gasLimit 0xfffffffffff "${accounts[@]}" > /dev/null &
  fi

  ganache_pid=$!
}

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

if [ "$SOLC_NIGHTLY" = true ]; then
  echo "Downloading solc nightly"
  wget -q https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/soljson-nightly.js -O /tmp/soljson.js && find . -name soljson.js -exec cp /tmp/soljson.js {} \;
fi

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/solidity-coverage

  if [ "$CONTINUOUS_INTEGRATION" = true ]; then
    cat coverage/lcov.info | node_modules/.bin/coveralls
  fi
else
  node_modules/.bin/truffle test "$@"
fi
