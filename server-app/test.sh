#!/bin/bash

pytest --cov=api/ --cov=lib --cov-report html:converage_re --cov-report term-missing