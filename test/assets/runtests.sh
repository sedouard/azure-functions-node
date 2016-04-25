#!/bin/bash
if [ "${TRAVIS_PULL_REQUEST}" = "false" ] 
then
	istanbul cover _mocha -- --recursive
    if [ "${?}" = "0" ]
    then
        codeclimate-test-reporter < coverage/lcov.info
    else
        exit 1
    fi
fi
